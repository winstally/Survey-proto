import { NextResponse } from 'next/server';
import { saveSurvey } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const surveyId = await saveSurvey(data);
    return NextResponse.json({ success: true, surveyId });
  } catch (error) {
    console.error('アンケート保存エラー:', error);
    return NextResponse.json(
      { error: 'アンケートの保存に失敗しました' },
      { status: 500 }
    );
  }
} 