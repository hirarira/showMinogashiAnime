# showMinogashiAnime
しょぼいカレンダーと連携したアニメリスト表示プログラム  

# 作り方
* Apache2 + MySQL + Linux + PHP のLAMP環境を想定しています。

    1. `create database anime` でDatabaseの作成
    2. `mysql -u "your_user_id" -p < ./sql/anime.sql` でTableの作成
    3. `./server/password_example.php` を参考にあなたのDBのuseridとPASSを入れて、 `password.php` を作る。
    4. しょぼいカレンダーにアクセス（ http://cal.syoboi.jp/ ）
    5. ログインをして、見ているアニメの設定から、見ているチャンネルを強調表示にする。
    6. js内の `hirarira617` になっているところをあなたのIDで置換する。（ハードコーディングごめん）
    7. 完成！
