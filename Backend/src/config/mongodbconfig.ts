import mongoose from 'mongoose'

export const connectMongoDB = async () => {
  const mongoUrl = process.env.MONGO_DB_URL
  if (mongoUrl) {
    try {
      mongoose.set('strictQuery', false)
      await mongoose.connect(mongoUrl)
      console.log('Connected to MongoDB')
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err)
      // proceed without DB (for dev) but warn
    }
  } else {
    console.warn('MONGO_DB_URL not set; running without MongoDB')
  }
}
