// src/server.js
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { configurePassport } from "./config/passport.js";

import authRoutes from './Routes/authRoutes.js';
import articleRoutes from './Routes/articleRoutes.js';
import categoryRoutes from './Routes/categoryRoutes.js';
import commentRoutes from './Routes/commentRoutes.js';
import reactionRoutes from './Routes/reactionRoutes.js';
import analyticsRoutes from './Routes/analyticsRoutes.js';
import adminRoutes from './Routes/adminRoutes.js';
import userRoutes from './Routes/userRoutes.js';

const app = express();
const prisma = new PrismaClient();

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport middleware
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Regular middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "News Portal API is running 🚀" });
});

app.get("/api/health", async (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);



app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  await testDatabaseConnection();
  console.log(`\n✨ Ready!\n`);
  console.log(`📧 Email/Password Auth: http://localhost:${PORT}/api/auth/login`);
  console.log(`🔐 Google Auth: http://localhost:${PORT}/api/auth/google`);
});