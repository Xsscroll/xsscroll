import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import axios from 'axios'

/**
 * ログインページ
 * 
 * ユーザーがメールアドレスとパスワードを入力して、
 * バックエンドにログイン要求を送るページです
 */
export default function Login() {
  const router = useRouter()
  
  // 入力フォームの状態を管理する変数
  const [email, setEmail] = useState('')        // メールアドレス
  const [password, setPassword] = useState('')  // パスワード
  const [loading, setLoading] = useState(false) // 送信中かどうか
  const [error, setError] = useState('')        // エラーメッセージ

  /**
   * ログイン処理
   * 「ログイン」ボタンを押したときに実行される関数
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // ページの自動リロードを防ぐ
    
    setLoading(true)
    setError('')

    try {
      // バックエンドの /auth/login エンドポイントにデータを送る
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
        {
          email: email,
          password: password,
        }
      )

      // ログイン成功時、トークンをローカルストレージに保存
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))

      // ホームページ（フィード）にリダイレクト
      router.push('/feed')
    } catch (err: any) {
      // エラーが発生した場合、ユーザーに表示
      setError(err.response?.data?.error?.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>ログイン - xsscroll</title>
        <meta name="description" content="xsscroll にログイン" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          {/* ロゴ・タイトル */}
          <h1 className="text-3xl font-bold text-center text-primary mb-2">xsscroll</h1>
          <p className="text-center text-gray-600 mb-8">ログインしてください</p>

          {/* エラーメッセージ表示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* ログインフォーム */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* メールアドレス入力欄 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* パスワード入力欄 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          {/* 登録ページへのリンク */}
          <p className="text-center text-gray-600 mt-6">
            アカウントをお持ちでませんか？{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              ここから登録
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
