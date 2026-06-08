import { Router } from 'express'
import { createNote, getNotes, getNote, updateNote, deleteNote, shareNote, getNotesTitle } from '../controllers/notesController'
import { authenticate } from '../middleware/authMiddleware'

const router = Router()

router.use(authenticate)
console.log('Notes routes initialized with authentication middleware');
router.post('/', createNote)
router.get('/', getNotes)
router.get('/:id', getNote)
router.put('/:id', updateNote)
router.delete('/:id', deleteNote)
router.post('/:id/share', shareNote)
router.get('/titles', getNotesTitle)

export default router
