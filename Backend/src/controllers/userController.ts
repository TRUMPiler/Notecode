import { Request, Response } from 'express'
import ApiResponse from '../utils/ApiResponse'
import { User } from '../models/User'
import UserModel, { IUser } from '../models/userModel'
import { signTemp, signRefresh, verifyToken } from '../utils/jwt'
import bcrypt from 'bcrypt'

const cookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: maxAgeMs,
  path: '/',
})

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as Partial<User>

    if (!email || !password) {
      return ApiResponse.error(res, 'Email and password required', 400)
    }

    // Find user by email
    const user = await UserModel.findOne({ email: email as string } as any)
    if (!user) return ApiResponse.error(res, 'Invalid credentials', 401)

    const match = await bcrypt.compare(password, user.password)
    if (!match) return ApiResponse.error(res, 'Invalid credentials', 401)

    const refreshToken = signRefresh({ email })
    const tempToken = signTemp({ email })

    // set cookies
    res.cookie('refresh_token', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    res.cookie('temp_jwt', tempToken, cookieOptions(15 * 60 * 1000))

    return ApiResponse.success(res, { user: { email: user.email, name: user.name, id: user._id } }, 'Login successful', 200)
  } catch (err) {
    console.error('login error', err)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as Partial<User>

    if (!name || !email || !password) {
      return ApiResponse.error(res, 'Name, email and password required', 400)
    }

    // Check if user already exists
    const existing = await UserModel.findOne({ email: email as string } as any)
    if (existing) return ApiResponse.error(res, 'User already exists', 409)

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
    const hashed = await bcrypt.hash(password, saltRounds)

    const created = await UserModel.create({ name, email, password: hashed })

    const refreshToken = signRefresh({ email })
    const tempToken = signTemp({ email })
    res.cookie('refresh_token', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    res.cookie('temp_jwt', tempToken, cookieOptions(15 * 60 * 1000))

    return ApiResponse.success(res, { user: { id: created._id, name: created.name, email: created.email } }, 'Registered', 201)
  } catch (err) {
    console.error('register error', err)
    return ApiResponse.error(res, 'Server error', 500)
  }
}

export const refreshTempToken = (req: Request, res: Response) => {
  const refresh = req.cookies?.refresh_token
  if (!refresh) return ApiResponse.error(res, 'Missing refresh token', 401)

  const decoded = verifyToken(refresh as string)
  if (!decoded) return ApiResponse.error(res, 'Invalid refresh token', 401)

  const payload = { email: (decoded as any).email }
  const tempToken = signTemp(payload)
  res.cookie('temp_jwt', tempToken, cookieOptions(15 * 60 * 1000))
  return ApiResponse.success(res, { renewed: true }, 'Temporary token renewed', 200)
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('temp_jwt', { path: '/' })
  res.clearCookie('refresh_token', { path: '/' })
  return ApiResponse.success(res, null, 'Logged out', 200)
}

