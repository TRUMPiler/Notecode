import mongoose, { Document, Schema } from 'mongoose'

export interface INote extends Document {
  title: string
  content: string
  owner: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const NoteSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
)

const NoteModel = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema)
export default NoteModel