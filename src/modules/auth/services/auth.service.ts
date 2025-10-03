import { Issuer, generators, Client } from "openid-client";
import jwt from "jsonwebtoken";
import * as AuthRepository from "../repositories/auth.repository";
import { AuthResponseDto, TokenPayload } from "../dtos/auth.dto";
import { Types } from "mongoose";

let googleClient: Client;
const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

async function getGoogleClient() {
  if (!googleClient) {
    const googleIssuer = await Issuer.discover("https://accounts.google.com");
    googleClient = new googleIssuer.Client({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uris: [redirectUri],
      response_types: ["code"],
    });
  }
  return googleClient;
}

// Step 1: Redirect URL
export async function getGoogleAuthUrl() {
  const client = await getGoogleClient();
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
export async function handleGoogleCallback(
  code: string,
  codeVerifier: string
): Promise<AuthResponseDto> {
  const client = await getGoogleClient();
  const tokenSet = await client.callback(
    redirectUri,
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
