import { Issuer, generators, Client } from "openid-client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as AuthRepository from "../repositories/auth.repository";
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
  TokenPayload,
} from "../dtos/auth.dto";
import { Types } from "mongoose";
import User, { IUser } from "../../../database/models/user.model";

class AuthService {
  private googleClient: Client | undefined;
  // store PKCE code_verifier per state value
  private codeVerifierStore: Map<string, string> = new Map();
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

    this.codeVerifierStore.set(state, codeVerifier);

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
    const codeVerifier = this.codeVerifierStore.get(state);
    if (!codeVerifier) throw new Error("Missing code verifier for state");
    // remove to prevent reuse
    this.codeVerifierStore.delete(state);

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

  private generateTokens(user: IUser): AuthResponseDto {
    const payload: TokenPayload = {
      userId: user._id as Types.ObjectId,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: "1d",
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

  async createAdmin(name: string, email: string, password: string) {
    const existing = await User.findOne({ email });
    if (existing) return null;
    const hashed = await bcrypt.hash(password, 10);
    return await AuthRepository.create(name, email, hashed);
  }

  async logout(userId: string) {
    return await AuthRepository.expireTokens(userId);
  }
}

export const authService = new AuthService();
