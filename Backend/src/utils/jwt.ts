import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export const TEMP_EXPIRY = '15m' // temporary jwt expiry
export const REFRESH_EXPIRY = '7d' // server/refresh cookie expiry

export function signTemp(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TEMP_EXPIRY })
}

export function signRefresh(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}
