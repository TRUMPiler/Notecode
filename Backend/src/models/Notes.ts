import mongoose, { Document, Schema } from 'mongoose'

export interface INote extends Document {
  title: string
  content: string
  private: boolean
  createdAt: Date
  updatedAt: Date
}

const NoteSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    private: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const NoteModel = (mongoose.models.Note as mongoose.Model<INote>) || mongoose.model<INote>('Note', NoteSchema)
export default NoteModel;