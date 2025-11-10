import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/app/lib/session';
import { NextResponse } from 'next/server';

interface SessionData {
  user?: any;
  selectedStore?: any;
}

export async function GET(request: Request) {
  try {
    const response = new Response();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    return NextResponse.json(
      {
        user: session.user || null,
        selectedStore: session.selectedStore || null
      },
      { headers: response.headers }
    );
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}