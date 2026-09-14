import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'

/**
 * 動画フィードページ
 * 
 * ログイン後、ユーザーが見る動画一覧ページです
 * バックエンドから動画データを取得して表示します
 */

// TypeScript: 動画のデータ型を定義
interface Video {
  id: string
  user_id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  is_premium: boolean
  views_count: number
  likes_count: number
  comments_count: number
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string
  }
}

interface User {
  id: string
  username: string
  email: string
  avatar_url: string
  is_premium: boolean
}

export default function Feed() {
  const router = useRouter()
  
  // 状態管理
  const [videos, setVideos] = useState<Video[]>([])      // 動画一覧
  const [user, setUser] = useState<User | null>(null)    // ログインユーザー情報
  const [loading, setLoading] = useState(true)            // 読み込み中かどうか
  const [error, setError] = useState('')                  // エラーメッセージ
  const [page, setPage] = useState(1)                     // ページネーション用

  /**
   * ページ読み込み時に実行
   * ユーザー情報と動画データを取得します
   */
  useEffect(() => {
    fetchUserAndVideos()
  }, [])

  /**
   * ユーザー情報と動画データを取得する関数
   */
  const fetchUserAndVideos = async () => {
    try {
      // ローカルストレージからトークンを取得
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')

      // トークンがなければログインページにリダイレクト
      if (!token) {
        router.push('/login')
        return
      }

      // ユーザー情報をローカルストレージから復元
      if (userStr) {
        setUser(JSON.parse(userStr))
      }

      // バックエンドから動画一覧を取得
      const videosResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos?page=1&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setVideos(videosResponse.data.data || [])
      setLoading(false)
    } catch (err: any) {
      console.error('データ取得エラー:', err)
      
      // トークンの有効期限が切れている場合
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      } else {
        setError('動画データの読み込みに失敗しました')
      }
      setLoading(false)
    }
  }

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  /**
   * いいねボタンを押したときの処理
   */
  const handleLike = async (videoId: string) => {
    try {
      const token = localStorage.getItem('token')
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos/${videoId}/likes`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // 動画の情報を更新（いいね数を増やす）
      setVideos(
        videos.map((video) =>
          video.id === videoId
            ? { ...video, likes_count: video.likes_count + 1 }
            : video
        )
      )
    } catch (err: any) {
      console.error('いいね失敗:', err)
      alert('いいねできませんでした')
    }
  }

  // 読み込み中の画面
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>フィード - xsscroll</title>
        <meta name="description" content="xsscroll フィード" />
      </Head>

      <div className="min-h-screen bg-light">
        {/* ヘッダー */}
        <header className="bg-white shadow sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/feed" className="text-2xl font-bold text-primary">
                xsscroll
              </Link>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/upload"
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-600 transition"
              >
                🎥 動画投稿
              </Link>

              {user && (
                <>
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center space-x-2 hover:text-primary transition"
                  >
                    <img
                      src={user.avatar_url || 'https://via.placeholder.com/40'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.username}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    ログアウト
                  </button>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 動画がない場合 */}
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">動画がまだ投稿されていません</p>
              <Link
                href="/upload"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-red-600 transition"
              >
                最初の動画を投稿する
              </Link>
            </div>
          ) : (
            /* 動画グリッド */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                >
                  {/* サムネイル */}
                  <div className="relative w-full aspect-video bg-black overflow-hidden group">
                    <img
                      src={video.thumbnail_url || 'https://via.placeholder.com/400x225'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition"
                    />
                    
                    {/* プレミアムバッジ */}
                    {video.is_premium && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        🔒 プレミアム
                      </div>
                    )}

                    {/* 再生アイコン */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition">
                        ▶️
                      </button>
                    </div>
                  </div>

                  {/* 動画情報 */}
                  <div className="p-4">
                    {/* タイトル */}
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition">
                      {video.title}
                    </h3>

                    {/* 投稿者情報 */}
                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={video.user.avatar_url || 'https://via.placeholder.com/40'}
                        alt={video.user.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {video.user.username}
                      </span>
                    </div>

                    {/* 説明文 */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {video.description}
                    </p>

                    {/* 統計情報 */}
                    <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                      <div className="flex items-center space-x-1">
                        <span>👁️</span>
                        <span>{video.views_count.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => handleLike(video.id)}
                        className="flex items-center space-x-1 hover:text-primary transition"
                      >
                        <span>👍</span>
                        <span>{video.likes_count}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{video.comments_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
