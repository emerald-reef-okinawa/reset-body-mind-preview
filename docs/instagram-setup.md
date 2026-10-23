# Instagram 自動反映の設定手順

トップページの「公式Instagram」に、最新の投稿3件を毎朝6時に自動で反映する仕組みです。

- Instagram公式のAPIで投稿を取得し、画像をこのサイトの中（`assets/instagram/`）に保存して表示します。
- 外部のウィジェットサービス（有料の埋め込みツールなど）は使いません。サイトを見る人の画面では、Instagramの読み込みは発生しません。
- 処理は GitHub Actions（`.github/workflows/instagram.yml`）で動きます。費用はかかりません。

設定が終わるまでは、今表示している投稿がそのまま残ります（エラーにもなりません）。

---

## 1. Instagramをプロアカウントにする

Instagramアプリ →「設定」→「アカウントの種類とツール」→「プロアカウントに切り替える」
（ビジネス／クリエイターのどちらでも可。すでにプロアカウントなら不要）

## 2. アクセストークンを発行する

1. https://developers.facebook.com/ にFacebookアカウントでログインし、開発者登録をする
2. 「マイアプリ」→「アプリを作成」
   - ユースケースで **「Instagramでメッセージとコンテンツを管理」**（Instagram API）を選ぶ
3. アプリの管理画面で **「Instagramログインによる API設定」** を開く
4. 「アクセストークンを生成」で、スタジオのInstagramアカウント（resetbodyandmind_official）を追加してログイン・許可する
5. 表示された **アクセストークン**（長い英数字）をコピーする
   - これは60日間有効なトークンです。手順4の自動更新を設定すれば、期限切れにはなりません

※ Meta の画面の名称は時期によって少し変わることがあります。

## 3. トークンを GitHub に登録する

GitHub のこのリポジトリ →「Settings」→「Secrets and variables」→「Actions」→「New repository secret」

| Name | Secret |
|---|---|
| `IG_ACCESS_TOKEN` | 手順2でコピーしたトークン |

トークンはここに直接貼り付けてください（チャットやメールには送らないでください）。

## 4. トークンの自動更新を設定する（推奨）

トークンは60日で切れるため、毎月1日と15日に自動で新しいものに差し替えます。そのために、GitHub の権限付きトークンを1つ登録します。

1. GitHub 右上のアイコン →「Settings」→「Developer settings」→「Personal access tokens」→「Fine-grained tokens」→「Generate new token」
2. 設定
   - Expiration：最長（または期限なし）
   - Repository access：Only select repositories → このリポジトリ
   - Permissions → Repository permissions → **Secrets：Read and write**
3. 発行されたトークンを、手順3と同じ場所に登録する

| Name | Secret |
|---|---|
| `GH_SECRETS_TOKEN` | 発行したトークン |

## 5. 動作確認

GitHub のこのリポジトリ →「Actions」→「Instagram feed」→「Run workflow」

数分後にサイトのInstagram欄が最新の投稿3件に変わっていれば完了です。以降は毎朝6時に自動で更新されます。

---

### 表示件数を変えたいとき

`.github/workflows/instagram.yml` の「Fetch latest posts」に `IG_POST_COUNT: "6"` のように追加します（デザインは3列なので、3の倍数がおすすめです）。

### うまく動かないとき

「Actions」タブで失敗した実行を開くと、エラー内容が確認できます。よくある原因は次のとおりです。

- トークンの期限切れ → 手順2・3をやり直す
- アカウントがプロアカウントでない → 手順1
