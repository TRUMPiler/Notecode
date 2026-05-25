import { Router } from 'express'
import { login, register, refreshTempToken, logout } from '../controllers/userController'

const router = Router()

router.post('/login', login)
router.post('/register', register)
router.post('/refresh', refreshTempToken)
router.post('/logout', logout)

export default router
