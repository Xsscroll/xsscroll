import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

// 環境変数を読み込む
dotenv.config()

// Expressアプリを作成
const app: Express = express()
const PORT = process.env.PORT || 5000

/**
 * ミドルウェア設定
 * 
 * ミドルウェア = すべてのリクエストを処理する前に共通処理を行う
 * 例：セキュリティチェック、リクエスト形式の確認、など
 */

// セキュリティヘッダーを追加
app.use(helmet())

// CORS設定（フロントエンドからのリクエストを許可）
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)

// JSONボディをパース
app.use(express.json({ limit: '10mb' }))

// URLエンコードされたボディをパース
app.use(express.urlencoded({ limit: '10mb', extended: true }))

/**
 * ロギングミドルウェア
 * すべてのリクエストをコ���ソールに表示
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

/**
 * テスト用のヘルスチェックエンドポイント
 * 
 * サーバーが起動しているか確認するために使う
 * curl http://localhost:5000/health でテスト可能
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'xsscroll backend is running!',
  })
})

/**
 * APIのベースパス
 * 
 * すべてのAPIエンドポイントは /api/ で始まる
 * 例：/api/auth/login, /api/videos, など
 */
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'このエンドポイントはまだ実装されていません',
    },
  })
})

/**
 * グローバルエラーハンドラー
 * 
 * すべてのエラーを捕捉して、ユーザーに適切なメッセージを返す
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)

  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  })
})

/**
 * サーバーを起動
 */
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║     xsscroll Backend Started       ║
╠════════════════════════════════════╣
║ 🚀 Server: http://localhost:${PORT}     ║
║ 🔍 Health: http://localhost:${PORT}/health ║
╚════════════════════════════════════╝
  `)
})

export default app
