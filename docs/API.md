# xsscroll - API仕様

## ベースURL
```
http://localhost:5000/api
```

## 認証
JWTトークンを使用した認証を実装予定

## エンドポイント一覧

### ユーザー管理

#### ユーザー登録
```
POST /auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}

Response: 201
{
  "id": "uuid",
  "username": "user123",
  "email": "user@example.com",
  "token": "jwt_token"
}
```

#### ログイン
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "id": "uuid",
  "username": "user123",
  "token": "jwt_token"
}
```

#### プロフィール取得
```
GET /users/:userId
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "username": "user123",
  "email": "user@example.com",
  "bio": "Hello, I'm...",
  "avatar_url": "https://...",
  "is_premium": false,
  "followers_count": 100,
  "following_count": 50,
  "videos_count": 15
}
```

#### プロフィール更新
```
PUT /users/:userId
Authorization: Bearer {token}
Content-Type: application/json

{
  "bio": "Updated bio",
  "avatar_url": "https://..."
}

Response: 200
{
  ...profile data
}
```

### 動画管理

#### 動画一覧取得
```
GET /videos?page=1&limit=10&sort=latest
Authorization: Bearer {token}

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Video title",
      "description": "Description",
      "video_url": "https://...",
      "thumbnail_url": "https://...",
      "duration": 300,
      "is_premium": false,
      "views_count": 1000,
      "likes_count": 50,
      "comments_count": 10,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

#### 動画投稿
```
POST /videos
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "My video",
  "description": "Video description",
  "video_file": <binary>,
  "thumbnail_file": <binary>,
  "is_premium": false
}

Response: 201
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "My video",
  ...
}
```

#### 動画詳細取得
```
GET /videos/:videoId
Authorization: Bearer {token}

Response: 200
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Video title",
  "description": "Description",
  "video_url": "https://...",
  "is_premium": false,
  "views_count": 1000,
  "likes_count": 50,
  "user": {
    "id": "uuid",
    "username": "user123",
    "avatar_url": "https://..."
  },
  "comments": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "content": "Great video!",
      "likes_count": 5,
      "created_at": "2024-01-01T00:00:00Z",
      "user": {
        "username": "commenter",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

#### 動画削除
```
DELETE /videos/:videoId
Authorization: Bearer {token}

Response: 204
```

### コメント機能

#### コメント追加
```
POST /videos/:videoId/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Great video!"
}

Response: 201
{
  "id": "uuid",
  "video_id": "uuid",
  "user_id": "uuid",
  "content": "Great video!",
  "likes_count": 0,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### コメント削除
```
DELETE /comments/:commentId
Authorization: Bearer {token}

Response: 204
```

### いいね機能

#### いいね追加
```
POST /videos/:videoId/likes
Authorization: Bearer {token}

Response: 201
{
  "id": "uuid",
  "user_id": "uuid",
  "video_id": "uuid"
}
```

#### いいね解除
```
DELETE /videos/:videoId/likes
Authorization: Bearer {token}

Response: 204
```

### 課金機能

#### プレミアム会員登録
```
POST /payments/subscribe
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan": "premium_monthly", // or premium_yearly
  "payment_method_id": "stripe_token"
}

Response: 201
{
  "id": "uuid",
  "user_id": "uuid",
  "status": "completed",
  "amount": 1000,
  "currency": "JPY",
  "transaction_id": "...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 購入履歴取得
```
GET /users/:userId/purchases
Authorization: Bearer {token}

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "video_id": "uuid",
      "amount": 500,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### フォロー機能

#### フォロー
```
POST /users/:userId/follow
Authorization: Bearer {token}

Response: 201
{
  "id": "uuid",
  "follower_id": "uuid",
  "following_id": "uuid"
}
```

#### フォロー解除
```
DELETE /users/:userId/follow
Authorization: Bearer {token}

Response: 204
```

### 広告機能

#### 広告一覧取得
```
GET /advertisements?page=1&limit=5
Authorization: Bearer {token}

Response: 200
{
  "data": [
    {
      "id": "uuid",
      "advertiser_id": "uuid",
      "title": "Ad title",
      "image_url": "https://...",
      "link_url": "https://...",
      "impressions_count": 1000,
      "clicks_count": 50
    }
  ]
}
```

#### 広告作成
```
POST /advertisements
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Ad title",
  "image_url": "https://...",
  "link_url": "https://...",
  "description": "Ad description"
}

Response: 201
{
  "id": "uuid",
  "advertiser_id": "uuid",
  "title": "Ad title",
  ...
}
```

## エラーハンドリング

### エラーレスポンス形式
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": []
  }
}
```

### よくあるエラーコード
- `UNAUTHORIZED` - 認証が必要
- `FORBIDDEN` - アクセス権限がない
- `NOT_FOUND` - リソースが見つからない
- `VALIDATION_ERROR` - バリデーションエラー
- `INTERNAL_ERROR` - サーバーエラー
