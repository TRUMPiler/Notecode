// <div class="tenor-gif-embed" data-postid="21057451" data-share-method="host" data-aspect-ratio="0.99375" data-width="100%"><a href="https://tenor.com/view/family-guy-crane-gif-21057451">Family Guy GIF</a>from <a href="https://tenor.com/search/family-gifs">Family GIFs</a></div> <script type="text/javascript" async src="https://tenor.com/embed.js"></script>

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()
import path from 'path'
import userRoutes from './routes/userRoutes'
import ApiResponse from './utils/ApiResponse'
import { connectMongoDB } from './config/mongodbconfig'
import { errorHandler } from './middleware/errorHandler'
import uploadRoutes from './routes/uploadRoutes'
import notesRoutes from './routes/notesRoutes'
import { WebSocketServer, WebSocket } from 'ws';




dotenv.config()

const app = express()
const port = process.env.PORT || 6066
const wss = new WebSocketServer({ port: 6067 });




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
// Mount notes routes under /notes
app.use('/notes', notesRoutes)
// Error handling middleware (must be last)
app.use(errorHandler)

//wss
// Map to keep track of connected clients per note room
const noteRooms = new Map<string, Set<WebSocket>>();

wss.on("connection", (ws, req) => {
  // Parse the noteId from the connection URL (e.g., ws://localhost:6060/?noteId=123)
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const noteId = url.searchParams.get('noteId');

  if (!noteId) {
    ws.close(1008, "noteId is required to connect");
    return;
  }

  if (!noteRooms.has(noteId)) {
    noteRooms.set(noteId, new Set());
  }
  noteRooms.get(noteId)!.add(ws);
  console.log(`WebSocket client connected to note room: ${noteId}`);

  ws.on("message", (message) => {
    const room = noteRooms.get(noteId);
    if (room) {
      // Broadcast the update to all OTHER clients in the same room
      for (const client of room) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      }
    }
  });

  ws.on("close", () => {
    const room = noteRooms.get(noteId);
    if (room) {
      room.delete(ws);
      // Clean up the room if it's empty
      if (room.size === 0) {  
        noteRooms.delete(noteId);
      }
    }
  });
});

const start = async () => {
  await connectMongoDB()
  app.listen(port, () => {
    console.log(`Backend (TypeScript) listening on http://localhost:${port}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server', err)
})