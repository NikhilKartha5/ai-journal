import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import diaryRoutes from './routes/diary.js';
import userRoutes from './routes/user.js';
import communityRoutes from './routes/community.js';

dotenv.config();

const app = express();

// --- Security & Hardening Middleware ---
// Allowed origin(s) (configure via env ALLOWED_ORIGINS comma separated)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Helmet base protections
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Additional strict CSP (adjust domains as needed)
app.use((req,res,next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https: ws:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});

// Rate limiting (generic) for auth + API
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, slow down.' }
});
app.use('/api/auth', authLimiter);

// Body parsing + size limits
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

// Sanitize against NoSQL injection / operator injection
app.use(mongoSanitize());
// Basic XSS filtering
app.use(xss());

// Simple request logging (omit in prod or replace with morgan/winston)
if (process.env.NODE_ENV !== 'production') {
  app.use((req,res,next)=>{ console.log(req.method, req.url); next(); });
}

// Validate essential env vars early
['MONGO_URI','JWT_SECRET'].forEach(k => { if(!process.env[k]) { console.error(`Missing required env var ${k}`); process.exit(1);} });

app.use('/api/auth', authRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/community', communityRoutes);

const BASE_PORT = parseInt(process.env.PORT || '5000', 10);

const connectDbAndStart = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  autoIndex: false,
    });
    console.log('MongoDB connected');
    startServer(BASE_PORT);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

function startServer(port, attempt = 0) {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  server.setTimeout(30_000); // avoid hanging sockets
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (attempt < 5) {
        const nextPort = port + 1;
        console.warn(`Port ${port} in use. Trying ${nextPort}...`);
        setTimeout(() => startServer(nextPort, attempt + 1), 500);
      } else {
        console.error('All attempted ports are in use. Set PORT env var to a free port.');
        process.exit(1);
      }
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

connectDbAndStart();
