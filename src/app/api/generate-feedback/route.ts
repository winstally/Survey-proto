import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 500 }
      );
    }

    const promptContent = `以下の内容を自然な文章にまとめてください：

【ご記入内容】
評価：星${body.rating}
撮影種類：${body.photoType}
写真の満足度：${body.photoSatisfaction}
スタッフ対応：${body.otherStaffResponse}
知ったきっかけ：${body.howFound.join('、')}
選んだ理由：${body.importantFactors.join('、')}
お客様の声：${body.feedback}

【基本ルール】
・一人称（私）で書く
・です・ます調
・お客様の声を重視
・性別を特定しない表現を使用（子どもなど・ただし、お客様の声にそれらの単語が入っている時のみ使用可）
・1-2段落程度`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: promptContent,
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const generatedText = (response.data as { content: Array<{ text: string }> }).content[0].text;

    return NextResponse.json({ generatedText });
    
  } catch (error: any) {
    if (error.isAxiosError) {
      console.error('Axiosエラー:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return NextResponse.json(
        { error: `APIリクエストに失敗しました: ${error.message}` },
        { status: error.response?.status || 500 }
      );
    }
    console.error('一般的なエラー:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}