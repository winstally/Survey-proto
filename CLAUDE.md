変更を加える場合は常にこのファイルを全て読み込み従うこと。
ただし、忖度はせずに全力を尽くしてください。

# Admin Console プロジェクト

Next.js 15を使用した管理コンソールアプリケーション

## 開発ルール(極力変更しない)

### 1. コア原則
- 日本語で回答すること
- App Router を標準採用
- TypeScript 必須（ESLint／型エラーは常にゼロ）
- 基本的にServer Actionsを使用
- リアルタイム通信が必要な場合のみAPI Routesを許可

### 2. データハンドリング
- ユーザー操作に依存しない → server components + Server Actions
- ユーザー操作に依存する → client components + Server Actions + SWR
- リアルタイム通信 → API Routes + WebRTC/WebSocket
- 更新は Server Actions、即時反映は useSWR.mutate で楽観的更新
- PostgreSQL は RLS + auth.uid() を利用

### 3. UI とスタイリング
- UI は極力自作せず、必ず shadcn/ui のコンポーネントを利用
- アイコンは lucide-react を統一使用
- URL 状態は nuqs に統一
- グローバル状態ライブラリは使用しない

#### カラー使用ルール
- **テキスト**: `text-foreground`（メイン）、`text-muted-foreground`（サブ）
- **メインカラー**: `indigo-800` のみ
- **許可カラー**: shadcn標準 + `red-700` + `green-600` + `yellow-600` +`black`
- **禁止**: 上記以外の色の直接使用

### 4. フォームとバリデーション
- 制御コンポーネント + react-hook-form
- スキーマ検証は Zod
- クライアント／サーバー両方で入力チェック

### 5. パフォーマンス
- use client / useEffect / useState は最小限、まず RSC
- クライアント側は Suspense でフォールバック
- 動的 import で遅延読み込み、画像は next/image、リンクは next/link
- any[] は 型安全性を事実上オフにする
- 可能な限り具体的な型／unknown[]／ジェネリックで代替
- どうしても使う場合はスコープを限定し、コメントや ESLint で "ここは意図的" と明示する
- 業務データはstore_idを含む、個人の行動データはusernameベースの設計思想

### 6. 開発・運用ルール
- 既存のファイルを極力活用
- コード修正時はプラスしていくのではなく不要な点を取り除くことを重視
- テストに使ったファイルが不要になったら都度削除
- 編集したファイルは最後に明記
- roleはmaster(全店舗管理)、store(店舗アカウント・店舗代表)、admin(店舗管理)、staff(どこかの店舗に所属する社員)、ap(どこかの店舗に所属するアルバイト)
- supabase mcpを使用し直接データベースを更新


## 開発コマンド

```bash
# 開発サーバー起動（推奨）
npm run dev:full  # HTTPSサーバー(3002)でSupabase Realtime有効

# 開発サーバー起動（HTTP）
npm run dev       # Next.jsのみ(3002)、HTTPS機能なし

# ビルド・本番
npm run build
npm start

# コード品質
npm run lint
```

