import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration for production and development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yuriaichatbot-frontend.vercel.app', 'https://frontend-xi-weld-26.vercel.app', 'https://frontend-kq34bi1gn-jjhlegos-projects.vercel.app', 'https://frontend-ro4uidzct-jjhlegos-projects.vercel.app', 'https://frontend-pdd7mcrim-jjhlegos-projects.vercel.app', 'https://frontend-oygbg0lww-jjhlegos-projects.vercel.app', 'https://frontend-1nlltanmh-jjhlegos-projects.vercel.app', 'https://frontend-naw1eeq3c-jjhlegos-projects.vercel.app', process.env.CORS_ORIGIN, process.env.FRONTEND_URL].filter((url): url is string => Boolean(url))
    : true, // 개발 환경에서는 모든 origin 허용
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI not found. Please set MONGODB_URI in .env file');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit in development, just continue without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

export default app;