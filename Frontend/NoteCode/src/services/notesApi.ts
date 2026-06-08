import api from '../lib/api'

export interface NoteData {
  title?: string
  content?: string
  private?: boolean
}

export const createNote = async (data: NoteData) => {
  const response = await api.post('/notes', data)
  return response.data
}

export const getNotes = async () => {
  const response = await api.get('/notes')
  return response.data
}

export const getNote = async (id: string) => {
  const response = await api.get(`/notes/${id}`)
  return response.data
}

export const updateNote = async (id: string, data: NoteData) => {
  const response = await api.put(`/notes/${id}`, data)
  return response.data
}

export const deleteNote = async (id: string) => {
  const response = await api.delete(`/notes/${id}`)
  return response.data
}
