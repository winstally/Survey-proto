import { getIronSession } from 'iron-session';

export interface SessionData {
  user?: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    selectedStore?: string;
  };
  accessToken?: string;
  codeVerifier?: string;
  state?: string;
  selectedStore?: string;
}

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "iron-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  },
};

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      userId: string;
      displayName: string;
      pictureUrl?: string;
    };
    accessToken?: string;
    code_verifier?: string;
    state?: string;
    selectedStore?: string;
  }
}