import { Issuer, generators, Client, custom } from "openid-client";

custom.setHttpOptionsDefaults({
  timeout: 10000,
});
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as AuthRepository from "../repositories/auth.repository";
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  TokenPayload,
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from "../dtos/auth.dto";
import { Types } from "mongoose";
import User, { IUser } from "../../../database/models/user.model";
import { EmailService } from "../../../shared/utils/email.service";
import { HttpError } from "../../../core/errors/HttpError";

class AuthService {
  private googleClient: Client | undefined;
  // private codeVerifierStore: Map<string, string> = new Map(); // Removed in favor of DB storage
  private redirectUri: string = process.env.GOOGLE_REDIRECT_URI!;
  private accessSecret: string = process.env.JWT_ACCESS_SECRET!;
  private refreshSecret: string = process.env.JWT_REFRESH_SECRET!;

  private async getGoogleClient(): Promise<Client> {
    if (!this.googleClient) {
      const googleIssuer = await Issuer.discover("https://accounts.google.com");
      this.googleClient = new googleIssuer.Client({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uris: [this.redirectUri],
        response_types: ["code"],
      });
    }
    return this.googleClient;
  }

  // Step 1: Redirect URL
  async getGoogleAuthUrl() {
    const client = await this.getGoogleClient();
    const state = generators.state();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    await AuthRepository.storeOAuthState(state, codeVerifier);

    return {
      url: client.authorizationUrl({
        scope: "openid email profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
        prompt: "select_account",
        // optionally: prompt: "consent select_account"
      }),
      codeVerifier,
      state,
    };
  }

  // Step 2: Callback handler
  async handleGoogleCallback(
    code: string,
    state: string
  ): Promise<AuthResponseDto> {
    const client = await this.getGoogleClient();
    const codeVerifier = await AuthRepository.getAndRemoveOAuthVerifier(state);
    if (!codeVerifier) throw new Error("Missing code verifier for state");
    // remove to prevent reuse -> handled by getAndRemoveOAuthVerifier

    const tokenSet = await client.callback(
      this.redirectUri,
      { code },
      { code_verifier: codeVerifier }
    );
    const claims = tokenSet.claims();

    if (!claims.email || !claims.sub)
      throw new Error("Google did not return required info");

    let user = await AuthRepository.findUserByGoogleId(claims.sub);
    if (!user) {
      user = await AuthRepository.findUserByEmail(claims.email);
    }

    if (!user) {
      user = await AuthRepository.createGoogleUser({
        name: claims.name || "Google User",
        email: claims.email,
        googleId: claims.sub,
      });
    }

    const payload: TokenPayload = {
      userId: user._id as Types.ObjectId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: "7d",
    });

    await AuthRepository.updateRefreshToken(
      (user._id as Types.ObjectId).toString(),
      refreshToken
    );

    return {
      user: {
        id: user._id as Types.ObjectId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await User.findOne({ email: dto.email });
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await User.create({
      name: dto.name,
      email: dto.email,
      password_hash: hashed,
      role: "customer",
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await User.findOne({ email: dto.email });
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new Error("Invalid email or password");

    return this.generateTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const payload = jwt.verify(
      refreshToken,
      this.refreshSecret
    ) as TokenPayload;
    const user = await User.findById(payload.userId);
    if (!user) throw new Error("User not found");

    return this.generateTokens(user);
  }

  async verifyAdmin(userId: Types.ObjectId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new HttpError(401, "Invalid or expired token");
    }

    const isAdmin = user.role === "admin";

    return {
      isAdmin,
      user: isAdmin
        ? {
            id: user._id as Types.ObjectId,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : undefined,
    };
  }

  private generateTokens(user: IUser): AuthResponseDto {
    const payload: TokenPayload = {
      userId: user._id as Types.ObjectId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: "7d",
    });

    user.refresh_token = refreshToken;
    user.save();

    return {
      user: {
        id: user._id as Types.ObjectId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  verifyToken(token: string, isRefresh = false): TokenPayload {
    try {
      const secret = isRefresh ? this.refreshSecret : this.accessSecret;
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async createAdmin(
    name: string,
    email: string,
    password: string,
    phone_number?: string
  ): Promise<IUser | null> {
    const existing = await User.findOne({ email });
    if (existing) return null;
    const hashed = await bcrypt.hash(password, 10);
    return await AuthRepository.create(name, email, hashed, phone_number);
  }

  async logout(userId: string) {
    return await AuthRepository.expireTokens(userId);
  }

  /**
   * Step 1: Send OTP to user's email
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const user = await AuthRepository.findUserByEmail(data.email);

    if (!user) {
      // Don't reveal if email exists
      throw new HttpError(404, "If this email exists, an OTP has been sent");
    }

    // Rate limiting: Max 3 requests per hour
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (
      user.last_otp_request &&
      user.last_otp_request > oneHourAgo &&
      (user.otp_request_count || 0) >= 3
    ) {
      throw new HttpError(
        429,
        "Too many OTP requests. Please try again in an hour"
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    // Store hashed OTP in database
    await AuthRepository.storePasswordResetOTP(
      data.email,
      hashedOtp,
      expiresAt
    );
    // Send OTP via email
    await EmailService.sendPasswordResetOTP(data.email, user.name, otp);
    console.log(`Password reset OTP for ${data.email}: ${otp}`);
  }

  /**
   * Step 2: Verify OTP and return reset token
   */
  async verifyOtp(
    data: VerifyOtpDto
  ): Promise<{ message: string; resetToken: string }> {
    const user = await AuthRepository.verifyPasswordResetOTP(data.email);

    if (!user) {
      throw new HttpError(400, "Invalid or expired OTP");
    }

    // Compare provided OTP with hashed OTP
    const isValid = await bcrypt.compare(data.otp, user.password_reset_otp!);

    if (!isValid) {
      throw new HttpError(400, "Invalid OTP");
    }

    // Generate temporary reset token (valid for 10 minutes)
    const resetToken = generators.random(32); // crypto-secure random token
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store reset token and clear OTP
    await AuthRepository.storeResetToken(data.email, resetToken, expiresAt);

    return {
      message:
        "OTP verified successfully. Use the reset token to change your password.",
      resetToken,
    };
  }

  /**
   * Step 3: Reset password with reset token
   */
  async resetPassword(data: ResetPasswordDto): Promise<void> {
    const user = await AuthRepository.verifyResetToken(
      data.email,
      data.resetToken
    );

    if (!user) {
      throw new HttpError(400, "Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password and clear OTP fields
    await AuthRepository.updatePassword(data.email, hashedPassword);

    // Clear reset token
    await AuthRepository.clearResetToken(data.email);
  }
}

export const authService = new AuthService();
