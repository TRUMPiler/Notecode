import NoteModel, { INote } from '../models/Notes'
import NoteOwnerModel from '../models/NotesOwner'
import userService from './userService'
import AppError from '../utils/AppError'
import mongoose from 'mongoose'

export interface NotePayload {
  title: string
  content: string
  private?: boolean
  ownerId?: string
}

export const createNote = async (payload: NotePayload) => {
  try {
    const { ownerId, ...noteData } = payload
    const created = await NoteModel.create(noteData as any)
    
    if (ownerId) {
      const noteOwner = await NoteOwnerModel.create({
        noteId: created._id,
        owner: new mongoose.Types.ObjectId(ownerId),
        role: 'owner',
      })
      console.log('✅ Successfully saved NoteOwner to DB:', noteOwner)
    }
    return created
  } catch (err: any) {
    throw new AppError('Failed to create note', 500, err?.message || err)
  }
}

export const getNotes = async (filter: any = {}) => {
  try {
    return await NoteModel.find(filter as any).sort({ createdAt: -1 })
  } catch (err: any) {
    throw new AppError('Failed to fetch notes', 500, err?.message || err)
  }
}

export const getNoteById = async (id: string | string[]) => {
  try {
    const _id = String(id)
    const note = await NoteModel.findById(_id)
    if (!note) throw new AppError('Note not found', 404)
    return note
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to fetch note', 500, err?.message || err)
  }
}

export const updateNoteById = async (id: string | string[], data: Partial<NotePayload>) => {
  try {
    const _id = String(id)
    const updated = await NoteModel.findByIdAndUpdate(_id, data as any, { new: true })
    if (!updated) throw new AppError('Note not found', 404)
    return updated
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to update note', 500, err?.message || err)
  }
}

export const deleteNoteById = async (id: string | string[]) => {
  try {
    const _id = String(id)
    const deleted = await NoteModel.findByIdAndDelete(_id)
    if (!deleted) throw new AppError('Note not found', 404)
    return deleted
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to delete note', 500, err?.message || err)
  }
}

export const shareNote = async (noteId: string, email: string, role: 'editor' | 'viewer') => {
  try {
    const user = await userService.findUserByEmail(email)
    if (!user) throw new AppError('User not found with this email', 404)

    let shared = await NoteOwnerModel.findOne({ noteId: new mongoose.Types.ObjectId(noteId), owner: user._id } as any)
    if (shared) {
      shared.role = role
      await shared.save()
    } else {
      shared = await NoteOwnerModel.create({ noteId: new mongoose.Types.ObjectId(noteId), owner: user._id, role })
    }
    console.log('✅ Successfully shared note in DB:', shared)
    return shared
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to share note', 500, err?.message || err)
  }
}

export const GetNotesTitle = async ( email: string) => {
  try {
    console.log('GetNotesTitle called with email:', email);
    const user = await userService.findUserByEmail(email)
    if (!user) throw new AppError('User not found with this email', 404)

    let listOfNotes = await NoteOwnerModel.find({ owner: user._id } as any)
    const notesTitles=listOfNotes.map((noteOwner) => {
      return NoteModel.findById(noteOwner.noteId).select('title')
    }
  );
  console.log('✅ Successfully fetched notes titles from DB:', notesTitles)
    return notesTitles
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to get notes', 500, err?.message || err)
  }
}

export default {
  createNote,
  getNotes,
  getNoteById,
  updateNoteById,
  deleteNoteById,
  shareNote,
}
