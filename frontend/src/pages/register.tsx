import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import axios from 'axios'

/**
 * 登録ページ
 * 
 * 新しいユーザーがアカウントを作成するためのページです
 */
export default function Register() {
  const router = useRouter()
  
  // フォーム入力の状態管理
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * 登録処理
   * 「登録」ボタンを押したときに実行される関数
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 入力値の検証
    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      // バックエンドの /auth/register エンドポイントにデータを送る
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
        {
          username: username,
          email: email,
          password: password,
        }
      )

      // 登録成功時、トークンをローカルストレージに保存
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))

      // ホームページ（フィード）にリダイレクト
      router.push('/feed')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>新規登録 - xsscroll</title>
        <meta name="description" content="xsscroll に登録" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-secondary to-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          {/* ロゴ・タイトル */}
          <h1 className="text-3xl font-bold text-center text-secondary mb-2">xsscroll</h1>
          <p className="text-center text-gray-600 mb-8">新規登録してください</p>

          {/* エラーメッセージ表示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* 登録フォーム */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* ユーザー名入力欄 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
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
                placeholder="••••••••（8文字以上）"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* パスワード確認入力欄 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            {/* 登録ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white font-bold py-2 rounded-lg hover:bg-teal-500 transition disabled:opacity-50"
            >
              {loading ? '登録中...' : '登録'}
            </button>
          </form>

          {/* ログインページへのリンク */}
          <p className="text-center text-gray-600 mt-6">
            すでにアカウントをお持ちですか？{' '}
            <Link href="/login" className="text-secondary font-bold hover:underline">
              ここからログイン
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
