import { Response } from 'express'

export default class ApiResponse {
  static success(res: Response, data: any = null, message = 'Success', status = 200) {
    return res.status(status).json({
      success: true,
      message,
      data,
      timestamp: Date.now(),
    })
  }

  static error(res: Response, message = 'Error', status = 400, details: any = null) {
    return res.status(status).json({
      success: false,
      message,
      error: details || message,
      timestamp: Date.now(),
    })
  }
}
