import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import * as userService from '../services/userService'
import ApiResponse from '../utils/ApiResponse'

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.temp_jwt
    if (!token) return ApiResponse.error(res, 'Unauthorized - No token provided', 401)

    const decoded = verifyToken(token) as any
    if (!decoded || !decoded.email) return ApiResponse.error(res, 'Unauthorized - Invalid token', 401)

    const user = await userService.findUserByEmail(decoded.email)
    if (!user) return ApiResponse.error(res, 'Unauthorized - User not found', 401)

    // Attach user to the request object safely
    ;(req as any).user = user
    next()
  } catch (err) {
    return ApiResponse.error(res, 'Unauthorized', 401)
  }
}