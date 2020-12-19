"use strict";
const Express = require("express");
let router = Express.Router();
const AnimeReview = require('./model/animeReview.js');
const AnimeAbout = require('./model/anime.js');
const AnimeStory = require('./model/animeStory.js');
const DBSetting = require('./model/dbSetting.js');

const sequelize = DBSetting();
let moment = require('moment');

const animeModel = {
  review: new AnimeReview(sequelize),
  about: new AnimeAbout(sequelize),
  story: new AnimeStory(sequelize)
}

const getMinogashi = require('./getMinogashiAnime');
const getShoboiAPI = require('./getShoboiAPI');
const getReview = require('./getReview');

if(animeModel.review == null){
  return;
}

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// しょぼいカレンダーより任意の日付の見るアニメを取得
getShoboiAPI.getAnyDay(router, animeModel);

// 未登録のアニメのサブタイを取得して登録
getShoboiAPI.getNoRegistStories(router, animeModel);

// 全ての見逃しアニメ情報を取得
getMinogashi.getAll(router, animeModel);

// アニメの見逃し情報を取得する
getMinogashi.getWeek(router, animeModel);

// レビューを1件返す
getReview.getOne(router, animeModel);

// 全件のレビューを返す
getReview.getAll(router, animeModel);

// アニメの全話数情報を取得
router.get("/getAnimeStoryList/:tid", (req, res)=>{
  let animePromises = [];
  animePromises.push( animeModel.about.getAnime(req.params.tid) );
  animePromises.push( animeModel.story.getAllAnimeStory(req.params.tid) );
  Promise.all(animePromises)
  .then((db_data)=>{
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: {
        about: db_data[0][0],
        story: db_data[1]
      }
    };
    res.send(res_body);
  });
});

// アニメの話数情報を更新
router.post("/setAnimeStory",(req, res)=>{
  let options = {
    tid: req.body.tid,
    count: req.body.count,
    minogashi: req.body.minogashi,
    comment: req.body.comment
  };
  res.header('Content-Type', 'application/json');
  animeModel.story.setAnimeStory(options)
  .then((response)=>{
    let res_body = {
      status: 'ok',
      date: moment()
    };
    res.send(res_body);
  })
  .catch((e)=>{
    let res_body = {
      status: 'ng',
      date: moment(),
      e: e
    };
    res.send(res_body);
  });
});

// アニメのレビューを更新
router.post("/setAnimeReview", (req, res)=>{
  let options = {
    tid: req.body.tid,
    rate: req.body.rate,
    comment: req.body.comment,
    watchDate: req.body.watchDate
  };
  res.header('Content-Type', 'application/json');
  animeModel.review.updateReview(options)
  .then((response)=>{
    let res_body = {
      status: 'ok',
      date: moment()
    };
    res.send(res_body);
  })
  .catch((e)=>{
    let res_body = {
      status: 'ng',
      date: moment(),
      e: e
    };
    res.send(res_body);
  });
});

// アニメの概要を更新
router.post("/setAnimeAbout", (req, res)=>{
  let options = {
    tid: req.body.tid,
    hashTag: req.body.hashTag,
    characterURL: req.body.characterURL,
    publicURL: req.body.publicURL
  };
  res.header('Content-Type', 'application/json');
  animeModel.about.updateAnimeAbout(options)
  .then((response)=>{
    let res_body = {
      status: 'ok',
      date: moment()
    };
    res.send(res_body);
  })
  .catch((e)=>{
    let res_body = {
      status: 'ng',
      date: moment(),
      e: e
    };
    res.send(res_body);
  });
});

module.exports = router;
