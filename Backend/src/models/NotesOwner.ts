import mongoose, { Document, Schema } from 'mongoose'

export interface INoteOwner extends Document {
  noteId: mongoose.Types.ObjectId
  owner: mongoose.Types.ObjectId
  role: 'owner' | 'editor' | 'viewer'
}

const NoteOwnerSchema: Schema = new Schema(
  {
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], required: true },
  },
  { timestamps: true, collection: 'notesowner', id: false}
)

// Delete the cached model to force Mongoose to re-compile it with the explicit collection name
if (mongoose.models.NoteOwner) {
  delete mongoose.models.NoteOwner;
}
const NoteOwnerModel = mongoose.model<INoteOwner>('NoteOwner', NoteOwnerSchema)
export default NoteOwnerModel
