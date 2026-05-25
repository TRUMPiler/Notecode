import { Request, Response, NextFunction } from 'express'
import ApiResponse from '../utils/ApiResponse'

export interface AppError extends Error {
  status?: number
  details?: any
}

export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  const details = err.details || null

  console.error(`[Error] ${message}:`, err)

  return ApiResponse.error(res, message, status, details)
}
