import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { testConnection } from './config/database'
import authRoutes from './routes/auth'
import videoRoutes from './routes/video'

// 環境変数を読み込む
dotenv.config()

// Expressアプリを作成
const app: Express = express()
const PORT = process.env.PORT || 5000

/**
 * ミドルウェア設定
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
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

/**
 * ヘルスチェック
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'xsscroll backend is running!',
  })
})

/**
 * APIルート登録
 * 
 * すべてのルートを /api パスに登録
 */
app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)

/**
 * 404 ハンドラー
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'このエンドポイントは見つかりません',
      path: req.path,
    },
  })
})

/**
 * グローバルエラーハンドラー
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
const startServer = async () => {
  try {
    // データベース接続テスト
    const isConnected = await testConnection()
    if (!isConnected) {
      console.error('❌ Failed to connect to database. Exiting...')
      process.exit(1)
    }

    // サーバーを起動
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════╗
║       🚀 xsscroll Backend Started 🚀      ║
╠═══════════════════════════════════════════╣
║                                           ║
║  📍 Server: http://localhost:${PORT}        ║
║  🔍 Health: http://localhost:${PORT}/health  ║
║                                           ║
║  📚 API Documentation:                    ║
║  • POST   /api/auth/register              ║
║  • POST   /api/auth/login                 ║
║  • GET    /api/auth/me                    ║
║  • POST   /api/videos                     ║
║  • GET    /api/videos                     ║
║  • GET    /api/videos/:id                 ║
║  • PUT    /api/videos/:id                 ║
║  • DELETE /api/videos/:id                 ║
║  • POST   /api/videos/:id/likes           ║
║  • GET    /api/users/:userId/videos       ║
║                                           ║
╚═══════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
