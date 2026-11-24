"use strict";

require('dotenv').config();

const Express = require("express");
const BodyParser = require('body-parser');
const app = Express();

// urlencodedとjsonは別々に初期化する
app.use(BodyParser.urlencoded({
    extended: true
}));
// サムネイルの base64 アップロードを受けられるよう JSON の上限を広げる
app.use(BodyParser.json({ limit: '8mb' }));

let server = app.listen(3333, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

// 旧フロントエンド（client 配下の管理画面）は Animel へ移行済みのため削除した。
// 静的配信は API ドキュメント（/apidocs）のみ。

// APIドキュメント（Swagger UI）。仕様書はこのリポジトリで管理する
app.use("/apidocs", Express.static(__dirname  + '/apidocs'));

let api = require('./api/api.js');
app.use('/api', api);

app.get("/test", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let res_body = { status: 'ok' };
  res.send(res_body);
});

// 404
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  let res_body = {
    status: 'ng',
    body: '404 not found'
  };
  res.status(404).send(res_body);
});
