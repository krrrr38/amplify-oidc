# Cognito Sample App

AWS Cognito を使用した React アプリケーションのサンプルです。MFA TOTP 認証とカスタムログイン画面を含んでいます。

## 機能

- **AWS Cognito ユーザープール**: ユーザー認証・認可
- **MFA TOTP**: 時間ベースワンタイムパスワード認証
- **独自の日本語ログイン画面**: 完全カスタムの認証UI
- **React フロントエンド**: モダンな SPA
- **Terraform**: インフラストラクチャ as Code

## プロジェクト構造

```
cognito-sample/
├── infrastructure/          # Terraform設定
│   ├── main.tf             # プロバイダー設定
│   ├── variables.tf        # 変数定義
│   ├── cognito.tf          # Cognitoリソース
│   ├── outputs.tf          # 出力値
│   └── terraform.tfvars    # 変数値
├── frontend/               # Reactアプリケーション
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── services/       # API呼び出し
│   │   └── hooks/          # カスタムフック
│   ├── package.json
│   └── vite.config.js
└── assets/                 # 静的ファイル
```

## セットアップ手順

### 1. インフラストラクチャのデプロイ

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### 2. 環境変数の設定

Terraform 実行後、出力値を使用して環境変数を設定します：

```bash
cd ../frontend
cp .env.example .env
```

`.env` ファイルを編集：
```
VITE_USER_POOL_ID=us-west-2_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

アプリケーションは http://localhost:3000 で利用可能です。

## 使用方法

### 1. ユーザー登録・サインイン

1. ホームページで「ログイン / サインアップ」をクリック
2. 独自の日本語ログイン画面で新規アカウント作成またはサインイン
3. メール認証を完了

### 2. MFA TOTP 設定

1. ダッシュボードで「MFA TOTP 設定」をクリック
2. 認証アプリ（Google Authenticator、Authy など）でQRコードをスキャン
3. 生成された6桁コードを入力して設定完了

### 3. 認証フロー

- 初回サインイン：メール認証のみ
- MFA設定後：パスワード認証 + TOTP認証

## 技術スタック

### インフラストラクチャ
- **Terraform**: v1.0+
- **AWS Provider**: v5.0+
- **AWS Cognito**: ユーザープール、クライアント、ドメイン

### フロントエンド  
- **React**: v18.2+
- **Vite**: 開発・ビルドツール
- **React Router**: ルーティング
- **AWS Amplify**: Cognito SDK
- **@aws-amplify/ui-react**: UIコンポーネント

## カスタマイズ

### ログイン画面のカスタマイズ

`frontend/src/components/Auth/` 配下のコンポーネントと `auth.css` を修正して、認証画面をカスタマイズできます。

### 認証フローのカスタマイズ

- `SignIn.jsx`: サインイン画面
- `SignUp.jsx`: サインアップ画面
- `ConfirmSignUp.jsx`: メール認証画面
- `ResetPassword.jsx`: パスワードリセット機能
- `MFASetup.jsx`: MFA設定画面

## トラブルシューティング

### よくある問題

1. **環境変数が読み込まれない**
   - `.env` ファイルが正しい場所にあるか確認
   - 変数名が `VITE_` で始まっているか確認

2. **Cognito認証エラー**
   - Terraform outputs の値が正しく設定されているか確認
   - Callback URL が正しく設定されているか確認

3. **MFA設定エラー**
   - デバイスの時刻が正確か確認
   - 認証アプリが正しくインストールされているか確認

### ログの確認

ブラウザの開発者ツールでコンソールログを確認してください。

## セキュリティ

- パスワードポリシー：8文字以上、大小英字・数字・記号を含む
- MFA必須設定
- セッションタイムアウト：24時間
- リフレッシュトークン：30日間

## ライセンス

MIT License