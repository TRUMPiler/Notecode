import { Request, Response } from 'express'
import ApiResponse from '../utils/ApiResponse'
import * as notesService from '../services/notesService'
import * as userService from '../services/userService'
import { verifyToken } from '../utils/jwt'
import NoteOwnerModel from '../models/NotesOwner'

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content, private: isPrivate } = req.body
    if (!title || !content) return ApiResponse.error(res, 'Title and content required', 400)

    const ownerId = (req as any).user ? String((req as any).user._id) : undefined;
    if (!ownerId) return ApiResponse.error(res, 'Unauthorized', 401)

    const created = await notesService.createNote({ title, content, private: !!isPrivate, ownerId })
    return ApiResponse.success(res, { note: created }, 'Note created', 201)
  } catch (err: any) {
    console.error('createNote error', err)
    if (err?.status) return ApiResponse.error(res, err.message || 'Error', err.status, err.details)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    
    const ownerships = await NoteOwnerModel.find({ owner: userId }).populate('noteId');
    console.log(`🔍 Found ${ownerships.length} NoteOwner records for user ${userId}`);
    const notes = ownerships.map((o: any) => o.noteId).filter(Boolean);

    return ApiResponse.success(res, { notes }, 'OK', 200)
  } catch (err: any) {
    console.error('getNotes error', err)
    if (err?.status) return ApiResponse.error(res, err.message || 'Error', err.status, err.details)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const getNote = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const userId = (req as any).user?._id;

    const note = await notesService.getNoteById(id)
    if (!note) return ApiResponse.error(res, 'Note not found', 404)

    const ownership = await NoteOwnerModel.findOne({ noteId: id as any, owner: userId });
    if (!ownership && note.private) return ApiResponse.error(res, 'Forbidden - You do not have access to this note', 403)

    return ApiResponse.success(res, { note }, 'OK', 200)
  } catch (err: any) {
    console.error('getNote error', err)
    if (err?.status) return ApiResponse.error(res, err.message || 'Error', err.status, err.details)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const updateNote = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const userId = (req as any).user?._id;
    
    const ownership = await NoteOwnerModel.findOne({ noteId: id as any, owner: userId });
    if (!ownership || (ownership.role !== 'owner' && ownership.role !== 'editor')) {
      return ApiResponse.error(res, 'Forbidden - You do not have permission to edit this note', 403)
    }

    const data = req.body
    const updated = await notesService.updateNoteById(id, data)
    if (!updated) return ApiResponse.error(res, 'Note not found', 404)
    return ApiResponse.success(res, { note: updated }, 'Updated', 200)
  } catch (err: any) {
    console.error('updateNote error', err)
    if (err?.status) return ApiResponse.error(res, err.message || 'Error', err.status, err.details)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const userId = (req as any).user?._id;

    const ownership = await NoteOwnerModel.findOne({ noteId: id as any, owner: userId });
    if (!ownership || ownership.role !== 'owner') {
      return ApiResponse.error(res, 'Forbidden - Only the owner can delete this note', 403)
    }

    const deleted = await notesService.deleteNoteById(id)
    if (!deleted) return ApiResponse.error(res, 'Note not found', 404)
    return ApiResponse.success(res, null, 'Deleted', 200)
  } catch (err: any) {
    console.error('deleteNote error', err)
    if (err?.status) return ApiResponse.error(res, err.message || 'Error', err.status, err.details)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const shareNote = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id)
    const userId = (req as any).user?._id;

    const ownership = await NoteOwnerModel.findOne({ noteId: id as any, owner: userId });
    if (!ownership || ownership.role !== 'owner') {
      return ApiResponse.error(res, 'Forbidden - Only the owner can share this note', 403)
    }

    const { email, role } = req.body
    if (!email || !role) return ApiResponse.error(res, 'Email and role required', 400)
    if (!['editor', 'viewer'].includes(role)) return ApiResponse.error(res, 'Invalid role', 400)
    
    const shared = await notesService.shareNote(id, email, role as 'editor' | 'viewer')
    return ApiResponse.success(res, { shared }, 'Note shared successfully', 200)
  } catch (err: any) {
    console.error('shareNote error', err)
    if (err?.status) return ApiResponse.error(res, err.message || 'Error', err.status, err.details)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const getNotesTitle = async (req: Request, res: Response) => {

    console.log('getNotesTitle called with query:', req.query);
  try {
    console.log('getNotesTitle called with query:', req.query);
    const email = String(req.query.email)
    if (!email) return ApiResponse.error(res, 'Email query parameter required', 400)
    const titles = await notesService.GetNotesTitle(email)
    return ApiResponse.success(res, { titles }, 'OK', 200)
  }
    catch (err: any) {
    console.error('getNotesTitle error', err)
    if (err?.status) return ApiResponse.error(res, err.message || 'Error', err.status, err.details)
    return ApiResponse.error(res, 'Server error', 500)
  }
};

export default {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  shareNote,
}
