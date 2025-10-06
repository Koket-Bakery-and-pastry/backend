// Import openid-client dynamically to avoid TypeScript import/runtime mismatches across versions
const OpenIDClient = require("openid-client");
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
  // openid-client's types may be loaded differently depending on installed version; use any to avoid TS import mismatch
  private googleClient: any | undefined;
  private redirectUri: string = process.env.GOOGLE_REDIRECT_URI!;
  private accessSecret = process.env.JWT_ACCESS_SECRET!;
  private refreshSecret = process.env.JWT_REFRESH_SECRET!;

  private async getGoogleClient() {
    if (!this.googleClient) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Issuer = OpenIDClient.Issuer || OpenIDClient.default?.Issuer;
      if (!Issuer) throw new Error("openid-client Issuer not found");
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
    const generators =
      OpenIDClient.generators || OpenIDClient.default?.generators;
    if (!generators) throw new Error("openid-client generators not found");
    const state = generators.state();
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    return {
      url: client.authorizationUrl({
        scope: "openid email profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
      }),
      codeVerifier,
    };
  }

  // Step 2: Callback handler
  async handleGoogleCallback(
    code: string,
    codeVerifier: string
  ): Promise<AuthResponseDto> {
    const client = await this.getGoogleClient();
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
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });

    await AuthRepository.updateRefreshToken(
      (user._id as Types.ObjectId).toString(),
      refreshToken
    );

    return {
      user: {
        id: (user._id as Types.ObjectId).toString(),
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
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: "7d",
    });
    user.refresh_token = refreshToken;

    user.save();

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}

export const authService = new AuthService();
