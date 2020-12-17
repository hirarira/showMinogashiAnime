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

// レビューを1件返す
router.get("/getAnimeReview/:tid", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let animePromises = [];
  animePromises.push( animeModel.review.getAnimeReview(req.params.tid) );
  animePromises.push( animeModel.about.getAnime(req.params.tid) );
  Promise.all(animePromises)
  .then((db_data)=>{
    // レビューがない場合には新規作成する
    if(db_data[0].length == 0){
      return animeModel.review.initReview(req.params.tid)
      .then((init_res)=>{
        let res_body = {
          status: 'ok make new review',
          body: null
        };
        res.send(res_body);
      });
    }
    else{
      let res_body = {
        status: 'ok',
        body: Object.assign(db_data[0][0].dataValues, db_data[1][0].dataValues)
      };
      res.send(res_body);
    }
  })
});

// 全件のレビューを返す
router.get("/getAllAnimeReview", (req, res)=>{
  let animePromises = [];
  animePromises.push( animeModel.review.getAllAnimeReview() );
  animePromises.push( animeModel.about.getAllAnime() );
  Promise.all(animePromises)
  .then((db_datas)=>{
    let animeList = [];
    let animeReviewList = db_datas[0];
    let animeAboutList = db_datas[1];
    for(let i=0; i<animeAboutList.length; i++){
      for(let j=0; j<animeReviewList.length; j++){
        if(animeAboutList[i].tid == animeReviewList[j].tid){
          animeList.push( Object.assign(animeAboutList[i].dataValues, animeReviewList[j].dataValues) );
          break;
        }
      }
    }
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: animeList
    };
    res.send(res_body);
  });
});

module.exports = router;
