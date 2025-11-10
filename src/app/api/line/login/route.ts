import { generateCodeVerifier, generateCodeChallenge } from '@/app/lib/pkce';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/session';
import { NextResponse } from 'next/server';
import { stores } from '@/app/api/line/login/store';

export async function POST(request: Request) {
  try {
    const response = new Response();
    const session = await getIronSession(request, response, sessionOptions);
    
    Object.keys(session).forEach(key => {
      if (key !== '__IS_IRON_SESSION') {
        delete (session as any)[key];
      }
    });
    if ('session' in session) {
      delete (session as any).session;
    }

    const { store: storeName } = await request.json();
    console.log('LINEログインAPI開始 - 店舗:', storeName);
    console.log('セッション情報:', session);
    
    const store = stores.find(s => s.name === storeName);
    if (!store) {
      throw new Error('店舗が見つかりません');
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = crypto.randomUUID();

    (session as any).code_verifier = codeVerifier;
    (session as any).state = state;
    (session as any).selectedStore = storeName;
    await session.save();

    console.log('更新後セッション情報:', session);
    if (!(session as any).code_verifier) {
      console.error('code_verifier がセッションに存在しません');
    }

    const authUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', store.lineChannelId);
    authUrl.searchParams.append('redirect_uri', store.lineCallbackUrl);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'profile openid bot_prompt');
    authUrl.searchParams.append('bot_prompt', 'aggressive');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('prompt', 'consent');

    return NextResponse.json(
      { authUrl: authUrl.toString() },
      { headers: response.headers }
    );
    
  } catch (error) {
    console.error('LINEログインAPIエラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}