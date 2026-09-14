import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import axios from 'axios'

/**
 * 動画投稿ページ
 * 
 * ユーザーが動画をアップロードするページです
 * 動画ファイル、タイトル、説明、プレミアム設定を入力できます
 */
export default function Upload() {
  const router = useRouter()

  // フォーム入力の状態管理
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  
  // UIの状態
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoPreview, setVideoPreview] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  /**
   * 動画ファイルが選択されたときの処理
   */
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（最大500MB）
      if (file.size > 500 * 1024 * 1024) {
        setError('動画ファイルは500MB以下にしてください')
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('video/')) {
        setError('動画ファイルを選択してください')
        return
      }

      setVideoFile(file)
      setError('')

      // プレビュー用のURLを作成
      const preview = URL.createObjectURL(file)
      setVideoPreview(preview)
    }
  }

  /**
   * サムネイルファイルが選択されたときの処理
   */
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // ファイルサイズチェック（最大10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError('サムネイルは10MB以下にしてください')
        return
      }

      // ファイル形式チェック
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください')
        return
      }

      setThumbnailFile(file)
      setError('')

      // プレビュー用のURLを作成
      const preview = URL.createObjectURL(file)
      setThumbnailPreview(preview)
    }
  }

  /**
   * 動画投稿処理
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    // 入力値の検証
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    if (!videoFile) {
      setError('動画ファイルを選択してください')
      return
    }

    if (title.length > 255) {
      setError('タイトルは255文字以内にしてください')
      return
    }

    if (description.length > 2000) {
      setError('説明は2000文字以内にしてください')
      return
    }

    setLoading(true)
    setError('')

    try {
      // トークンを取得
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // FormData を使用してファイルを送信
      // FormData = 通常のJSONではなく、ファイルを含むデータを送るための形式
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('video_file', videoFile)
      formData.append('is_premium', String(isPremium))

      if (thumbnailFile) {
        formData.append('thumbnail_file', thumbnailFile)
      }

      // バックエンドにアップロード
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/videos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            // アップロード進捗を計算
            const progress = Math.round(
              (progressEvent.loaded / (progressEvent.total || 1)) * 100
            )
            setUploadProgress(progress)
          },
        }
      )

      // 投稿成功 → フィードにリダイレクト
      alert('動画が投稿されました！')
      router.push('/feed')
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || '動画の投稿に失敗しました'
      )
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <>
      <Head>
        <title>動画投稿 - xsscroll</title>
        <meta name="description" content="xsscroll に動画を投稿" />
      </Head>

      <div className="min-h-screen bg-light">
        {/* ヘッダー */}
        <header className="bg-white shadow sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/feed" className="text-2xl font-bold text-primary">
              xsscroll
            </Link>
            <Link href="/feed" className="text-gray-600 hover:text-primary transition">
              フィードに戻る
            </Link>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">動画を投稿する</h1>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              {/* 動画ファイル選択 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📹 動画ファイル <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-input"
                  />
                  <label htmlFor="video-input" className="cursor-pointer block">
                    {videoFile ? (
                      <div>
                        <p className="text-lg font-medium text-primary">✓ 選択済み</p>
                        <p className="text-sm text-gray-600 mt-1">{videoFile.name}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          ここをクリックして動画をアップロード
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          MP4, WebM など（最大500MB）
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 動画プレビュー */}
              {videoPreview && (
                <div className="bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* タイトル */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="動画のタイトルを入力してください"
                  maxLength={255}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {title.length}/255 文字
                </p>
              </div>

              {/* 説明文 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📄 説明文
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="動画の説明を入力してください"
                  maxLength={2000}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/2000 文字
                </p>
              </div>

              {/* サムネイル選択 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🖼️ サムネイル画像
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-secondary transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    id="thumbnail-input"
                  />
                  <label htmlFor="thumbnail-input" className="cursor-pointer block">
                    {thumbnailFile ? (
                      <div>
                        <p className="text-lg font-medium text-secondary">✓ 選択済み</p>
                        <p className="text-sm text-gray-600 mt-1">{thumbnailFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          サムネイル画像を選択（オプション）
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          JPG, PNG など（最大10MB）
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* サムネイルプレビュー */}
              {thumbnailPreview && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}

              {/* プレミアム設定 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="font-medium text-gray-700">
                    🔒 この動画をプレミアムコンテンツにする
                  </span>
                </label>
                <p className="text-sm text-gray-600 mt-2 ml-8">
                  プレミアムに設定すると、プレミアム会員のみが視聴できます
                </p>
              </div>

              {/* アップロード進捗バー */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    {uploadProgress}% アップロード中...
                  </p>
                </div>
              )}

              {/* 送信ボタン */}
              <button
                type="submit"
                disabled={loading || !videoFile}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? `投稿中... (${uploadProgress}%)` : '動画を投稿する'}
              </button>
            </form>

            {/* 注意事項 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">📌 投稿ガイドライン</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 著作権を侵害しないコンテンツをアップロードしてください</li>
                <li>• 過度に暴力的または不適切なコンテンツは禁止です</li>
                <li>• スパムや詐欺的なコンテンツは削除される可能性があります</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
