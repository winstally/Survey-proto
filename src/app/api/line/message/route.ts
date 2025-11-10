import { NextResponse } from 'next/server';
import { LineMessageRequest } from '@/types/line';
import { stores } from '@/app/api/line/login/store';

export async function POST(request: Request) {
  try {
    const { userId, surveyData }: LineMessageRequest = await request.json();

    if (!userId || !surveyData) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const store = stores.find(s => s.name === surveyData.store);
    if (!store) {
      console.error('店舗情報が見つかりません:', surveyData.store);
      return NextResponse.json({ error: 'Store not found' }, { status: 400 });
    }

    const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';

    const message = {
      to: userId,
      messages: [
        {
          type: "flex",
          altText: "ご回答ありがとうございます😆",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              spacing: "md",
              contents: [
                {
                  type: "text",
                  text: "内容はあっていますか？",
                  weight: "bold",
                  size: "lg",
                    align: "center"
                  },
                  {
                  type: "text",
                  text:
                    `利用店舗　：${surveyData.store}\n` +
                    `お名前　　：${surveyData.name}\n` +
                    `お電話番号：${surveyData.phone}`,
                    wrap: true,
                    size: "lg"
                  },
                  {
                  type: "button",
                  action: {
                    type: "message",
                    label: "確認しました",
                    text:
                      `${surveyData.name}様\n` +
                      `以下の内容で確認しました。\n\n` +
                      `■ ご利用内容\n` +
                      `撮影内容　：${surveyData.photoType}\n` +
                      `来店日　　：${formatDate(surveyData.visitDate)}\n` +
                      `利用店舗　：${surveyData.store}\n\n` +
                      `■ お客様情報\n` +
                      `お名前　　：${surveyData.name}\n` +
                      `お電話番号：${surveyData.phone}`,
                  },
                  style: "primary",
                  color: "#1DB446"
                }
              ]
            }
          }
        }
      ]
    };

    console.log('LINE送信リクエスト:', {
      endpoint: LINE_MESSAGING_API,
      messageData: message,
      accessToken: store.lineMessagingToken
    });

    const response = await fetch(LINE_MESSAGING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.lineMessagingToken}`
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE APIエラー:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to send LINE message: ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending LINE message:', error);
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}