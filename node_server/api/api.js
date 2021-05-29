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

// しょぼいカレンダーより任意の日付の見るアニメを取得
// GET /getShoboiAnimeAnyDay/
getShoboiAPI.getAnyDay(router, animeModel);

// 未登録のアニメのサブタイを取得して登録
// GET /getNoRegistStories/:tid
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

// 全件のレビューを返す
// GET /getAllAnimeReview
getReview.getAll(router, animeModel);

// アニメの全話数情報を取得
// GET /getAnimeStoryList/:tid
getInfo.getAnyDay(router, animeModel);

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

module.exports = router;
