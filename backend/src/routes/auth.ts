import { Router, Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import * as authController from '../controllers/authController'

/**
 * 認証ルート
 * 
 * /api/auth/* のエンドポイントを定義
 */

const router = Router()

/**
 * 認証ミドルウェア
 * 
 * リクエストに含まれたJWTトークンを検証して、
 * userId を req オブジェクトに追加する
 */
const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ヘッダーから Authorization を取得
  // 形式: "Bearer <token>"
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'トークンが見つかりません',
      },
    })
  }

  try {
    // トークンを検証
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_secret_key'
    ) as any

    // ユーザーIDをrequestに保存
    (req as any).userId = decoded.userId

    next()
  } catch (error) {
    res.status(403).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'トークンが無効です',
      },
    })
  }
}

/**
 * POST /api/auth/register
 * ユーザー登録
 */
router.post('/register', authController.register)

/**
 * POST /api/auth/login
 * ユーザーログイン
 */
router.post('/login', authController.login)

/**
 * GET /api/auth/me
 * 現在のユーザー情報を取得
 * 認証が必要
 */
router.get('/me', authenticateToken, authController.getCurrentUser)

export default router
