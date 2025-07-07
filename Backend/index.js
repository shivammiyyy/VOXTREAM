import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // ✅ socket.io's Server
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.Frontend_url,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.Frontend_url,
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
});

app.get('/me', (req, res) => {
  res.send("Hello world");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
