import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import userRoutes from './routes/userRoutes'
import ApiResponse from './utils/ApiResponse'
import { connectMongoDB } from './config/mongodbconfig'
import { errorHandler } from './middleware/errorHandler'
import uploadRoutes from './routes/uploadRoutes'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Allow credentials so cookies can be set from browsers during development
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || true,
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))

// Serve uploaded files statically from /uploads
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

// Health
app.get('/health', (_req, res) => {
  return ApiResponse.success(res, { status: 'ok', timestamp: Date.now() }, 'Health OK', 200)
})

// Mount user routes under /user
app.use('/user', userRoutes)
// Mount upload routes under /upload
app.use('/upload', uploadRoutes)
// Error handling middleware (must be last)
app.use(errorHandler)


const start = async () => {
  await connectMongoDB()

  app.listen(port, () => {
    console.log(`Backend (TypeScript) listening on http://localhost:${port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server', err)
})