export class AppError extends Error {
  status: number
  details?: any
  constructor(message: string, status = 500, details?: any) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.details = details
    if (Error.captureStackTrace) Error.captureStackTrace(this, AppError)
  }
}

export default AppError
