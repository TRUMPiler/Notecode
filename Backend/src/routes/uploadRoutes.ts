import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

const router = express.Router()

// Ensure uploads are stored in the project-level `uploads` directory (Backend/uploads)
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Use memory storage so we can upload directly to Cloudinary if configured
const upload = multer({ storage: multer.memoryStorage() })

// Configure Cloudinary when env vars provided. Support CLOUDINARY_URL or explicit vars.
// Dynamically ensure Cloudinary is configured when env vars are available.
let cloudConfigured = false
const ensureCloudinaryConfigured = () => {
  // If already configured, return true
  if (cloudConfigured) return true

  if (process.env.CLOUDINARY_URL) {
    // Try to configure Cloudinary explicitly from CLOUDINARY_URL (handles parsing)
    try {
      // CLOUDINARY_URL looks like: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
      const url = process.env.CLOUDINARY_URL.trim()
      const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/)
      if (m) {
        const [, api_key, api_secret, cloud_name] = m
        cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
        // verify api_key present in runtime config
        const cfg = cloudinary.config() as any
        if (cfg.api_key) {
          cloudConfigured = true
          console.log('Cloudinary configured from CLOUDINARY_URL')
          return true
        }
      } else {
        // Fallback: allow cloudinary library to pick up env vars by setting secure
        cloudinary.config({ secure: true })
        const cfg = cloudinary.config() as any
        if (cfg.api_key) {
          cloudConfigured = true
          console.log('Cloudinary configured from CLOUDINARY_URL (env parsed by library)')
          return true
        }
      }
    } catch (err) {
      console.error('Failed to configure Cloudinary from CLOUDINARY_URL', err)
    }
  }

  if (process.env.CLOUDINARY_CLOUD_NAME &&  process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      })
      cloudConfigured = true
      console.log('Cloudinary configured via explicit env vars')
      return true
    } catch (err) {
      console.error('Failed to configure Cloudinary from explicit env vars', err)
    }
  }

  return false
}

const uploadToLocal = (fileBuffer: Buffer, originalName: string) => {
  const ext = path.extname(originalName) || '.png'
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
  const filePath = path.join(uploadsDir, filename)
  fs.writeFileSync(filePath, fileBuffer)
  console.log('Saved file locally:', filePath)
  const host = process.env.BACKEND_HOST || `http://localhost:${process.env.PORT || 5000}`
  return `${host}/uploads/${filename}`
}

const uploadToCloudinaryBuffer = (fileBuffer: Buffer, folder?: string) => {
    console.log(process.env.CLOUDINARY_URL ? 'CLOUDINARY_URL is set but failed to configure' : 'CLOUDINARY_URL not set')
  console.log(`CLOUDINARY_API_KEY present: ${!!process.env.CLOUDINARY_API_KEY}, CLOUDINARY_API_SECRET present: ${!!process.env.CLOUDINARY_API_SECRET}`)
  console.log(`CLOUDINARY_CLOUD_NAME present: ${!!process.env.CLOUDINARY_CLOUD_NAME}`)
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) {
        console.error('Cloudinary upload_stream error:', error?.message || error)
        return reject(error)
      }
      resolve(result)
    })
    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
    
  })
}

router.post('/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const buffer = req.file.buffer
    // If cloudinary configured, upload there
    if (ensureCloudinaryConfigured()) {
      const result = await uploadToCloudinaryBuffer(buffer, process.env.CLOUDINARY_UPLOAD_FOLDER || '')
      console.log('Uploaded to Cloudinary:', result?.secure_url || result?.url)
      return res.json({ url: result.secure_url || result.url })
    }
    // Fallback to local storage
    const url = uploadToLocal(buffer, req.file.originalname)
    return res.json({ url })
  } catch (err) {
    console.error('Upload failed', err)
    return res.status(500).json({ error: 'Upload failed' })
  }
})

router.post('/image-from-url', async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'No url provided' })

    // If Cloudinary configured, use its fetch/upload from the remote URL
    if (ensureCloudinaryConfigured()) {
      try {
        const result = await cloudinary.uploader.upload(url, { folder: process.env.CLOUDINARY_UPLOAD_FOLDER || '' })
        console.log('Fetched and uploaded to Cloudinary:', result?.secure_url || result?.url)
        return res.json({ url: result.secure_url || result.url })
      } catch (err) {
        console.error('Cloudinary upload from URL failed:', err?.message || err)
        // fallthrough to local save
      }
    }

    // Fallback: download and save locally
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const fileUrl = uploadToLocal(Buffer.from(response.data), path.basename(url))
    return res.json({ url: fileUrl })
  } catch (err) {
    console.error('Failed to fetch image from url', err)
    return res.status(500).json({ error: 'Failed to fetch image' })
  }
})

// Status endpoint for debugging Cloudinary configuration (does NOT return secrets)
router.get('/status', (_req, res) => {
  try {
    const configured = ensureCloudinaryConfigured()
    const cfg = cloudinary.config() as any
    return res.json({
      hasCloudinary: configured,
      cloud_name: cfg.cloud_name || null,
      cloudinary_url_present: !!process.env.CLOUDINARY_URL,
      cloud_api_key_present: !!process.env.CLOUDINARY_API_KEY, 
      cloud_api_secret_present: !!process.env.CLOUDINARY_API_SECRET,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Status check failed' })
  }
})

export default router