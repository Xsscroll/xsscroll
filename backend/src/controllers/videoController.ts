import { Request, Response } from 'express'
import * as VideoModel from '../models/Video'

/**
 * 動画コントローラー
 * 
 * 動画のアップロード、取得、削除などの処理
 */

/**
 * 新しい動画をアップロード
 * 
 * POST /api/videos
 */
export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { title, description, video_url, thumbnail_url, duration, is_premium } = req.body

    // 入力値の検証
    if (!title || !video_url || !duration) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'タイトル、動画URL、再生時間は必須です',
        },
      })
    }

    if (title.length > 255) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'タイトルは255文字以内にしてください',
        },
      })
    }

    // 動画を作成
    const video = await VideoModel.createVideo(
      userId,
      title,
      description || '',
      video_url,
      thumbnail_url || null,
      duration,
      is_premium || false
    )

    res.status(201).json({
      message: '動画がアップロードされました',
      video,
    })
  } catch (error: any) {
    console.error('Upload video error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '動画のアップロード中にエラーが発生しました',
      },
    })
  }
}

/**
 * 動画を取得
 * 
 * GET /api/videos/:id
 */
export const getVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const video = await VideoModel.getVideoById(id)
    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: '動画が見つかりません',
        },
      })
    }

    // 閲覧数をカウント
    await VideoModel.incrementViews(id)

    res.json({ video })
  } catch (error: any) {
    console.error('Get video error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '動画の取得中にエラーが発生しました',
      },
    })
  }
}

/**
 * すべての動画を取得（フィード）
 * 
 * GET /api/videos
 */
export const getVideos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ページとリミットは正の数にしてください（リミット最大100）',
        },
      })
    }

    const { videos, total } = await VideoModel.getAllVideos(page, limit)

    res.json({
      data: videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get videos error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '動画一覧の取得中にエラーが発生しました',
      },
    })
  }
}

/**
 * ユーザーの動画を取得
 * 
 * GET /api/users/:userId/videos
 */
export const getUserVideos = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ページとリミットは正の数にしてください（リミット最大100）',
        },
      })
    }

    const { videos, total } = await VideoModel.getVideosByUserId(userId, page, limit)

    res.json({
      data: videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get user videos error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'ユーザーの動画一覧の取得中にエラーが発生しました',
      },
    })
  }
}

/**
 * 動画を更新
 * 
 * PUT /api/videos/:id
 */
export const updateVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params
    const { title, description, is_premium } = req.body

    // 動画が存在するか確認
    const video = await VideoModel.getVideoById(id)
    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: '動画が見つかりません',
        },
      })
    }

    // 所有者かどうか確認
    if (video.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'この動画を更新する権限がありません',
        },
      })
    }

    // 動画を更新
    const updatedVideo = await VideoModel.updateVideo(id, {
      title,
      description,
      is_premium,
    })

    res.json({
      message: '動画が更新されました',
      video: updatedVideo,
    })
  } catch (error: any) {
    console.error('Update video error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '動画の更新中にエラーが発生しました',
      },
    })
  }
}

/**
 * 動画を削除
 * 
 * DELETE /api/videos/:id
 */
export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    // 動画が存在するか確認
    const video = await VideoModel.getVideoById(id)
    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: '動画が見つかりません',
        },
      })
    }

    // 所有者かどうか確認
    if (video.user_id !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'この動画を削除する権限がありません',
        },
      })
    }

    // 動画を削除
    await VideoModel.deleteVideo(id)

    res.json({
      message: '動画が削除されました',
    })
  } catch (error: any) {
    console.error('Delete video error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: '動画の削除中にエラーが発生しました',
      },
    })
  }
}

/**
 * 動画にいいねをする
 * 
 * POST /api/videos/:id/likes
 */
export const likeVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    // 動画が存在するか確認
    const video = await VideoModel.getVideoById(id)
    if (!video) {
      return res.status(404).json({
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: '動画が見つかりません',
        },
      })
    }

    // TODO: ユーザーが既にいいねしているか確認（Likeテーブルを実装したら）

    // いいね数をカウント
    await VideoModel.incrementLikes(id)

    res.json({
      message: 'いいねしました',
    })
  } catch (error: any) {
    console.error('Like video error:', error)
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'いいね処理中にエラーが発生しました',
      },
    })
  }
}
