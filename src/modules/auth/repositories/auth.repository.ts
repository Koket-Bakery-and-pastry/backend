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
