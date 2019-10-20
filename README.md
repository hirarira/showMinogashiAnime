# showMinogashiAnime
しょぼいカレンダーと連携したアニメリスト表示プログラム  

## デモサイト
 * http://v.chashitsu.org:3333/

## 共通環境設定（しょぼいカレンダー側）
  1. しょぼいカレンダーにアクセス（ http://cal.syoboi.jp/ ）
  1. ログインをして、見ているアニメの設定から、見ているチャンネルを強調表示にする。
  1. しょぼいカレンダーのユーザIDを控える

## 動作方法（Docker編）
  1. `git clone https://github.com/hirarira/showMinogashiAnime.git`
  1. `Dockerfile` を開き、 `ANIME_SHOBOI_CALENDAR_USERNAME` をあなたのユーザIDに変える
  1. `docker-compose build`
  1. `docker-compose up -d`
  1. `http://localhost:3333/` にアクセスし、動作確認。

## 動作方法（Node.js 直叩き編）
### 環境説明
  * express.js + MySQL(MariaDB)

### 環境構築
  1. DBにアクセスし、`create database anime` でDatabaseの作成
  1. `mysql -u "YOUR_DB_USER" -p < ./sql/anime.sql` でDB TABLEの作成
  1. `~/.bash_profile` にDBアクセス方法を追記

  ```
  export ANIME_DB_USER_NAME=****
  export ANIME_DB_PASS=****
  export ANIME_DB_HOST=localhost
  export ANIME_SHOBOI_CALENDAR_USERNAME=(取得したいしょぼいカレンダーのユーザID)
  ```

  1. `source ~/.bash_profile` で設定を反映
  1. `npm install` で必要ライブラリをインストール
  1. `node ./node_server/showMinogashiAnimeServer.js` で起動
  1. `http://localhost:3333/` にアクセスし、動作確認。
