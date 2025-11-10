import 'iron-session';

declare module 'iron-session' {
  interface IronSessionData {
    code_verifier?: string;
    state?: string;
  }
}