// src/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profilePicture: true,
          isActive: true,
          isGoogleAuth: true,
        }
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const googleId = profile.id;
          const name = profile.displayName;
          const profilePicture = profile.photos[0]?.value;

          // Check if user exists with this googleId
          let user = await prisma.user.findUnique({
            where: { googleId }
          });

          if (user) {
            return done(null, user);
          }

          // Check if user exists with this email
          user = await prisma.user.findUnique({
            where: { email }
          });

          if (user) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                isGoogleAuth: true,
                profilePicture: profilePicture || user.profilePicture,
              }
            });
            return done(null, user);
          }

          // Create new user
          const randomPassword = Math.random().toString(36).slice(-16);
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(randomPassword, salt);

          user = await prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
              googleId,
              isGoogleAuth: true,
              profilePicture: profilePicture || 'default-avatar.png',
              role: 'USER',
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              profilePicture: true,
            }
          });

          done(null, user);
        } catch (error) {
          console.error('Google auth error:', error);
          done(error, null);
        }
      }
    )
  );
};

export default passport;