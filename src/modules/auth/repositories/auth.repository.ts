import User from "../../../database/models/user.model";
// auth/repositories/auth.repository.ts

export async function findUserByEmail(email: string) {
  return await User.findOne({ email });
}

export async function findUserByGoogleId(googleId: string) {
  return await User.findOne({ googleId });
}

export async function createGoogleUser(data: {
  name: string;
  email: string;
  googleId: string;
  role?: "customer" | "admin";
  refresh_token?: string;
}) {
  const user = new User({
    name: data.name,
    email: data.email,
    googleId: data.googleId,
    password_hash: "GOOGLE_USER", // dummy value since Google users don’t have password
    role: data.role || "customer",
    refresh_token: data.refresh_token,
  });
  return await user.save();
}

export async function updateRefreshToken(
  userId: string,
  refresh_token: string
) {
  return await User.findByIdAndUpdate(userId, { refresh_token }, { new: true });
}

export async function expireTokens(userId: string) {
  return await User.findByIdAndUpdate(
    userId,
    { refresh_token: null },
    { new: true }
  );
}

export async function create(
  name: string,
  email: string,
  password: string,
  phone_number?: string
) {
  const user = await User.create({
    name: name,
    email: email,
    password_hash: password,
    role: "admin",
    phone_number: phone_number,
  });
  return user;
}

export async function storePasswordResetOTP(
  email: string,
  hashedOtp: string,
  expiresAt: Date
) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const user = await User.findOne({ email });
  if (!user) return null;

  // Reset counter if last request was more than 1 hour ago
  if (!user.last_otp_request || user.last_otp_request < oneHourAgo) {
    user.otp_request_count = 0;
  }

  user.password_reset_otp = hashedOtp;
  user.password_reset_otp_expires = expiresAt;
  user.otp_request_count = (user.otp_request_count || 0) + 1;
  user.last_otp_request = now;

  return await user.save();
}

export async function verifyPasswordResetOTP(email: string) {
  return await User.findOne({
    email,
    password_reset_otp: { $exists: true },
    password_reset_otp_expires: { $gt: new Date() },
  });
}

export async function updatePassword(email: string, newPasswordHash: string) {
  return await User.findOneAndUpdate(
    { email },
    {
      password_hash: newPasswordHash,
      password_reset_otp: null,
      password_reset_otp_expires: null,
      otp_request_count: 0,
    },
    { new: true }
  );
}

export async function clearOTP(email: string) {
  return await User.findOneAndUpdate(
    { email },
    {
      password_reset_otp: null,
      password_reset_otp_expires: null,
    },
    { new: true }
  );
}

export async function storeResetToken(
  email: string,
  resetToken: string,
  expiresAt: Date
) {
  return await User.findOneAndUpdate(
    { email },
    {
      password_reset_token: resetToken,
      password_reset_token_expires: expiresAt,
      password_reset_otp: null,
      password_reset_otp_expires: null,
    },
    { new: true }
  );
}

export async function verifyResetToken(email: string, resetToken: string) {
  return await User.findOne({
    email,
    password_reset_token: resetToken,
    password_reset_token_expires: { $gt: new Date() },
  });
}

export async function clearResetToken(email: string) {
  return await User.findOneAndUpdate(
    { email },
    {
      password_reset_token: null,
      password_reset_token_expires: null,
    },
    { new: true }
  );
}
