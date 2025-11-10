import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/session';
import { stores } from '@/app/api/line/login/store';

export async function GET(request: Request) {
  const response = new Response();
  try {
    const session = await getIronSession(request, response, sessionOptions);
    const selectedStore = (session as any).selectedStore;
    const codeVerifier = (session as any).code_verifier;

    console.log('セッション情報:', {
      selectedStore,
      codeVerifier,
      session,
    });

    const store = stores.find(s => s.name === selectedStore);
    if (!store) {
      console.log('店舗情報が見つかりません:', selectedStore);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
      const loginOptionsUrl = new URL('/login-error', baseUrl);
      return NextResponse.redirect(loginOptionsUrl.toString(), {
        status: 303,
        headers: response.headers,
      });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.log('認証コードがURLに含まれていません');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
      const loginOptionsUrl = new URL('/login-error', baseUrl);
      return NextResponse.redirect(loginOptionsUrl.toString(), {
        status: 303,
        headers: response.headers,
      });
    }
    if (!codeVerifier) {
      console.log('code_verifier がセッションに存在しません');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
      const loginOptionsUrl = new URL('/login-error', baseUrl);
      return NextResponse.redirect(loginOptionsUrl.toString(), {
        status: 303,
        headers: response.headers,
      });
    }

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: store.lineCallbackUrl,
      client_id: store.lineChannelId,
      client_secret: store.lineChannelSecret,
      code_verifier: codeVerifier,
    });

    console.log('トークンリクエストパラメータ:', tokenParams.toString());

    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.log('LINEログインエラー詳細:', {
        error: tokenData,
        type: 'token_error',
        timestamp: new Date().toISOString(),
        store: selectedStore,
      });
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
      const loginOptionsUrl = new URL('/login-error', baseUrl);
      return NextResponse.redirect(loginOptionsUrl.toString(), {
        status: 303,
        headers: response.headers,
      });
    }

    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.log('プロフィール取得エラー詳細:', {
        error: profileData,
        type: 'profile_error',
        timestamp: new Date().toISOString(),
        userId: tokenData.access_token,
      });
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
      const loginOptionsUrl = new URL('/login-error', baseUrl);
      return NextResponse.redirect(loginOptionsUrl.toString(), {
        status: 303,
        headers: response.headers,
      });
    }

    (session as any).user = {
      userId: profileData.userId,
      displayName: profileData.displayName,
      pictureUrl: profileData.pictureUrl,
    };
    (session as any).accessToken = tokenData.access_token;

    const isFriend = tokenData.scope?.includes('bot_prompt');
    (session as any).isFriend = isFriend;
    await session.save();

    console.log('セッションにユーザー情報を保存しました:', {
      user: (session as any).user,
      isFriend,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
    const redirectUrl = new URL('/survey-form', baseUrl);
    return NextResponse.redirect(redirectUrl.toString(), {
      status: 303,
      headers: response.headers,
    });
  } catch (error) {
    console.log('予期せぬエラー詳細:', {
      error,
      type: 'unexpected_error',
      timestamp: new Date().toISOString(),
      path: '/api/line/callback',
    });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not defined');
    const loginOptionsUrl = new URL('/login-error', baseUrl);
    return NextResponse.redirect(loginOptionsUrl.toString(), {
      status: 303,
      headers: response.headers,
    });
  }
}

export async function POST(request: Request) {
  try {
    const response = new Response();
    const session = await getIronSession(request, response, sessionOptions);
    const { profile, access_token } = await request.json();

    if (!profile || !access_token) {
      console.log('POST: 無効なデータが送信されました');
      return NextResponse.json({ error: 'Invalid data received' }, { status: 400 });
    }

    (session as any).user = profile;
    (session as any).accessToken = access_token;
    await session.save();

    console.log('POST: セッションにユーザー情報が保存されました');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('POST: コールバック処理中のエラー:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

function isMobile(request: Request): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  return /iPhone|iPad|iPod|Android/i.test(userAgent);
}