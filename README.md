# showMinogashiAnime
しょぼいカレンダーと連携したアニメリスト表示プログラム  


## 動作方法
### 環境説明
* express.js + MySQL(MariaDB)

### 環境構築
  1. DBにアクセスし、`create database anime` でDatabaseの作成
  1. `mysql -u "YOUR_DB_USER" -p < ./sql/anime.sql` でDB TABLEの作成
  1. `~/.bash_profile` にDBアクセス方法を追記

  ```
  export ANIME_DB_USER_NAME=****
  export ANIME_DB_PASS=****
  ```

  1. `source ~/.bash_profile` で設定を反映
  1. しょぼいカレンダーにアクセス（ http://cal.syoboi.jp/ ）
  1. ログインをして、見ているアニメの設定から、見ているチャンネルを強調表示にする。
  1. `./node_server/client/js/userConfig.js` の `userName` をあなたのしょぼいカレンダーのIDに変更する。
  1. `npm install` で必要ライブラリをインストール
  1. `node ./node_server/showMinogashiAnimeServer.js` で起動
  1. `http://localhost:3333/` にアクセスし、動作確認。
