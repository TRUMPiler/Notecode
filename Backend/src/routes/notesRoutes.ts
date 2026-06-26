import { Router } from 'express'
import { createNote, getNotes, getNote, updateNote, deleteNote, shareNote, getNotesTitle } from '../controllers/notesController'
import { authenticate } from '../middleware/authMiddleware'

const router = Router()

router.use(authenticate)

router.get('/titles', getNotesTitle)
router.get('/:id', getNote)
router.put('/:id', updateNote)
router.delete('/:id', deleteNote)
router.post('/:id/share', shareNote)
router.post('/', createNote)
router.get('/', getNotes)


export default router
