import bcrypt from 'bcrypt'
import UserModel, { IUser } from '../models/userModel'
import AppError from '../utils/AppError'

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authenticateUser = async (email: string, password: string) => {
  try {
    const user = await UserModel.findOne({ email } as any)
    if (!user) throw new AppError('Invalid credentials', 401)
    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new AppError('Invalid credentials', 401)
    return user
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to authenticate user', 500, err?.message || err)
  }
}

export const registerUser = async ({ name, email, password }: RegisterPayload) => {
  try {
    const existing = await UserModel.findOne({ email } as any)
    if (existing) throw new AppError('User already exists', 409)
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
    const hashed = await bcrypt.hash(password, saltRounds)
    const created = await UserModel.create({ name, email, password: hashed })
    return created
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to register user', 500, err?.message || err)
  }
}

export const findUserByEmail = async (email: string) => {
  try {
    return await UserModel.findOne({ email } as any)
  } catch (err: any) {
    throw new AppError('Failed to find user', 500, err?.message || err)
  }
}

export default {
  authenticateUser,
  registerUser,
  findUserByEmail,
}
