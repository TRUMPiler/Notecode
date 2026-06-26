import { Router } from 'express'
import { login, register, refreshTempToken, logout, googleLogin, forgotPassword, resetPassword } from '../controllers/userController'

const router = Router()

router.post('/google-login', googleLogin)
router.post('/login', login)
router.post('/register', register)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshTempToken)
router.post('/logout', logout)
// router.post()

export default router
