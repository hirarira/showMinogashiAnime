"use strict";
const Express = require("express");
let router = Express.Router();
const AnimeReview = require('./model/animeReview.js');
const AnimeAbout = require('./model/anime.js');
const AnimeStory = require('./model/animeStory.js');
const DBSetting = require('./model/dbSetting.js');

const sequelize = DBSetting();

const animeModel = {
  review: new AnimeReview(sequelize),
  about: new AnimeAbout(sequelize),
  story: new AnimeStory(sequelize)
}

const auth = require('./auth');
const getMinogashi = require('./getMinogashiAnime');
const getShoboiAPI = require('./getShoboiAPI');
const getReview = require('./getReview');
const getInfo = require('./getInfo');
const updateInfo = require('./updateInfo');

if(animeModel.review == null){
  return;
}

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// サムネイル画像の配信（実ファイルは node_server/thumbnails、DBにはファイル名だけを持つ）
router.use('/thumbnails', Express.static(require('path').join(__dirname, '..', 'thumbnails')));

// 認証テスト用エンドポイント（Google ID トークン必須）
// GET /authTest
router.get("/authTest", require('cors')(), auth.requireGoogleAuth, (req, res)=>{
  res.header('Content-Type', 'application/json');
  res.send({
    status: 'ok',
    body: {
      email: req.googleUser.email,
      sub: req.googleUser.sub,
      name: req.googleUser.name
    }
  });
});

// 書き込み系エンドポイントの認証（二段構え：Google Bearer / nginx Basic の印）
// CORS プリフライト（OPTIONS）は認証情報を持たないため、cors() を先に置いて通す
const writePaths = [
  '/getShoboiAnimeAnyDay',
  '/getNoRegistStories',
  '/setAnimeStory',
  '/setAnimeReview',
  '/setAnimeAbout',
  '/setAnimeStatus',
  '/setAnimeThumbnail',
  '/deleteAnimeThumbnail'
];
router.use(writePaths, require('cors')(), auth.requireWriteAuth);

// しょぼいカレンダーより任意の日付の見るアニメを取得
// POST /getShoboiAnimeAnyDay/
getShoboiAPI.getAnyDay(router, animeModel);

// 未登録のアニメのサブタイを取得して登録
// POST /getNoRegistStories/:tid
getShoboiAPI.getNoRegistStories(router, animeModel);

// 全ての見逃しアニメ情報を取得
// GET /getWeekMinogashiAnime
getMinogashi.getAll(router, animeModel);

// アニメの見逃し情報を取得する
// GET /getAllMinogashiAnime
getMinogashi.getWeek(router, animeModel);

// レビューを1件返す
// GET /getAnimeReview/:tid
getReview.getOne(router, animeModel);

// 特定の放送年度のアニメを取得する
// GET /getWatchDate/:watchDate
getReview.getWatchDate(router, animeModel);

// 特定の得点のアニメレビューを取得する
// GET /getRoundRate
getReview.getRoundRate(router, animeModel);

// タイトル部分一致でアニメを検索する
// GET /searchAnime/:query
getReview.search(router, animeModel);

// 全件のレビューを返す
// GET /getAllAnimeReview
getReview.getAll(router, animeModel);

// 特定の視聴ステータスのアニメを取得する
// GET /getAnimeByStatus/:status
getReview.getByStatus(router, animeModel);

// アニメの全話数情報を取得
// GET /getAnimeStoryList/:tid
getInfo.getAnyDay(router, animeModel);

// DB完結で任意の時間のアニメ情報を返す
// GET /getAnimeAnyDay/:start/:end
getInfo.getOnlyDBAnyAnime(router, animeModel);

// 数分後に放送するアニメ情報を返す
// GET /getNowAnime/:limit
getInfo.getNowAnime(router, animeModel);

// アニメの話数情報を更新
// POST /setAnimeStory
updateInfo.setStory(router, animeModel);

// アニメのレビューを更新
// POST /setAnimeReview
updateInfo.setReview(router, animeModel);

// アニメの概要を更新
// POST /setAnimeAbout
updateInfo.setAbout(router, animeModel);

// アニメの視聴ステータスを更新
// POST /setAnimeStatus
updateInfo.setStatus(router, animeModel);

// サムネイル画像を保存
// POST /setAnimeThumbnail
updateInfo.setThumbnail(router, animeModel);

// サムネイル画像を削除
// POST /deleteAnimeThumbnail
updateInfo.deleteThumbnail(router, animeModel);

module.exports = router;
