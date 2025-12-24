import { Schema, model, Document } from "mongoose";

export interface IOAuthState extends Document {
  state: string;
  code_verifier: string;
  createdAt: Date;
}

const OAuthStateSchema = new Schema<IOAuthState>({
  state: { type: String, required: true, unique: true },
  code_verifier: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Expire after 10 mins
});

export const OAuthState = model<IOAuthState>("OAuthState", OAuthStateSchema);
