import bcrypt from 'bcrypt'
import UserModel, { IUser } from '../models/userModel'
import AppError from '../utils/AppError'
import { OAuth2Client } from 'google-auth-library'
import crypto from 'crypto';

// Initialize the Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage' // Required for @react-oauth/google auth-code flow
);

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authenticateUser = async (email: string, password: string) => {
  try {
    const user = await UserModel.findOne({ email } as any)
    if (!user) throw new AppError('Invalid credentials', 401)
    
    if (user.isGoogleUser) {
      throw new AppError('Please sign in using Google.', 403)
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new AppError('Invalid credentials', 401)
    return user
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to authenticate user', 500, err?.message || err)
  }
}

export const registerUser = async ({ name, email, password }: RegisterPayload) => {
  try {
    const existing = await UserModel.findOne({ email } as any)
    if (existing) {
      if (existing.isGoogleUser) {
        throw new AppError('Email already registered via Google. Please sign in with Google.', 409)
      }
      throw new AppError('User already exists', 409)
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
    const hashed = await bcrypt.hash(password, saltRounds)
    const created = await UserModel.create({ name, email, password: hashed })
    return created
  } catch (err: any) {
    if (err?.name === 'AppError' || err?.status) throw err
    throw new AppError('Failed to register user', 500, err?.message || err)
  }
}

export const findUserByEmail = async (email: string) => {
  try {
    return await UserModel.findOne({ email } as any)
  } catch (err: any) {
    throw new AppError('Failed to find user', 500, err?.message || err)
  }
}

export const googleAuthenticate = async (email: string, name: string, profilePictureUrl: string) => {
  try {
    let user = await UserModel.findOne({ email } as any)
    if (!user) {
      // Generate a long, random, unusable password for Google users
      const randomPassword = Math.random().toString(36).slice(-16);
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
      const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
      user = await UserModel.create({ email, name, profilePictureUrl, password: hashedPassword,isGoogleUser: true })
    } else {
      // If user exists, ensure their picture is up-to-date and they are marked as a Google user.
      if (user.profilePictureUrl !== profilePictureUrl || !user.isGoogleUser) {
        user.profilePictureUrl = profilePictureUrl

        user.isGoogleUser = true
        await user.save()
      }
    }
    return user
  } catch (err: any) {
    throw new AppError('Failed to authenticate with Google', 500, err?.message || err)
  }
}

export const loginWithGoogle = async (code: string) => {
  try {
    // 1. Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);
    if (!tokens.id_token) {
      throw new AppError('Failed to retrieve ID token from Google', 400);
    }

    // 2. Verify the ID token and get user payload
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      throw new AppError('Invalid Google token payload', 400);
    }

    const { email, name, picture } = payload;

    // 3. Authenticate or register the user in our system
    return await googleAuthenticate(email, name, picture || '');
  } catch (err: any) {
    throw new AppError('Google login failed', 500, err?.message || err)
  }
}

export const generatePasswordResetToken = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    // Don't throw an error to prevent email enumeration
    return null;
  }
  if (user.isGoogleUser) {
    throw new AppError('This account is linked with Google. Please sign in using Google.', 400);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  // Token expires in 10 minutes
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  // In a real app, you would email this token to the user
  console.log(`Password reset token for ${email}: ${resetToken}`);
  console.log(`Reset URL: http://localhost:5173/reset-password/${resetToken}`);

  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  user.password = await bcrypt.hash(newPassword, saltRounds);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};


export default {
  authenticateUser,
  registerUser,
  findUserByEmail,
  googleAuthenticate,
  loginWithGoogle,
}
