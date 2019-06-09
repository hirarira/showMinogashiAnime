"use strict";
const Express = require("express");
let router = Express.Router();
const Sequelize = require('sequelize');
const AnimeReview = require('./model/animeReview.js');
const AnimeAbout = require('./model/anime.js');
const AnimeStory = require('./model/animeStory.js');
const DBSetting = require('./model/dbSetting.js');

const sequelize = DBSetting();
let moment = require('moment');
let request_promise = require('request-promise');
let animeReview = new AnimeReview(sequelize);
let animeAbout = new AnimeAbout(sequelize);
let animeStory = new AnimeStory(sequelize);

if(animeReview == null){
  return;
}

// アニメ情報とアニメ各話情報の結合
function assignAnimeAboutAndStory(about, story){
  let minogashiAnimeList = [];
  for(let i=0; i<story.length; i++){
    for(let j=0; j<about.length; j++){
      if(story[i].tid == about[j].tid){
        minogashiAnimeList.push(
           Object.assign(story[i].dataValues, about[j].dataValues)
        );
        break;
      }
    }
  }
  return minogashiAnimeList;
}

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next();
});

// しょぼいカレンダーより任意の日付の見るアニメを取得
router.get("/getShoboiAnimeAnyDay/", (req, res)=>{
  const shoboiHost = "http://cal.syoboi.jp/";
  const accessURL = shoboiHost + "rss2.php";
  let options = {
    filter: req.query.filter,
    alt: req.query.alt,
    usr: req.query.usr,
    start: req.query.start,
    end: req.query.end
  }
  request_promise.get({
    url: accessURL,
    qs: options
  })
  .then((response)=>{
    // TODO: DB保存処理を加える
    res.header('Content-Type', 'application/json');
    res.send(response);
  });
});

// アニメの全話数情報を取得
router.get("/getAnimeStoryList/:tid", (req, res)=>{
  let animePromises = [];
  animePromises.push( animeAbout.getAnime(req.params.tid) );
  animePromises.push( animeStory.getAllAnimeStory(req.params.tid) );
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
  animeStory.setAnimeStory(options)
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
      date: moment()
    };
    res.send(res_body);
  });
});

// アニメのレビューを更新
router.post("/setAnimeReview", (req, res)=>{
  let options = {
    tid: req.body.tid,
    rate: req.body.rate,
    comment: req.body.comment
  };
  res.header('Content-Type', 'application/json');
  animeReview.updateReview(options)
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
      date: moment()
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
  animeAbout.updateAnimeAbout(options)
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
      date: moment()
    };
    res.send(res_body);
  });
});

// レビューを1件返す
router.get("/getAnimeReview/:tid", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let animePromises = [];
  animePromises.push( animeReview.getAnimeReview(req.params.tid) );
  animePromises.push( animeAbout.getAnime(req.params.tid) );
  Promise.all(animePromises)
  .then((db_data)=>{
    // レビューがない場合には新規作成する
    if(db_data[0].length == 0){
      return animeReview.initReview(req.params.tid);
    }
    else{
      let res_body = {
        status: 'ok',
        body: Object.assign(db_data[0][0].dataValues, db_data[1][0].dataValues)
      };
      res.send(res_body);
    }
  })
  .then((init_res)=>{
    let res_body = {
      status: 'ok make new review',
      body: null
    };
    res.send(res_body);
  });
});

// 全件のレビューを返す
router.get("/getAllAnimeReview", (req, res)=>{
  let animePromises = [];
  animePromises.push( animeReview.getAllAnimeReview() );
  animePromises.push( animeAbout.getAllAnime() );
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

// 全ての見逃しアニメ情報を取得
router.get("/getAllMinogashiAnime", (req, res)=>{
  let minogashiAnimeListData;
  animeStory.getAllMinogashiStory()
  .then((minogashiList)=>{
    let tidList = [];
    for(let i=0; i<minogashiList.length; i++){
      if( tidList.indexOf(minogashiList[i].tid) == -1 ){
        tidList.push(minogashiList[i].tid);
      }
    }
    minogashiAnimeListData = minogashiList;
    return animeAbout.getAnimeList(tidList);
  })
  .then((animeList)=>{
    let minogashiAnimeList = assignAnimeAboutAndStory(animeList, minogashiAnimeListData);
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: minogashiAnimeList
    };
    res.send(res_body);
  });
});

// 過去一週間の見逃しアニメ情報を取得
router.get("/getWeekMinogashiAnime", (req, res)=>{
  let minogashiAnimeListData;
  let lastWeek = moment().subtract(7, 'days').startOf('day');
  animeStory.getWeekMinogashiAnime(lastWeek)
  .then((minogashiList)=>{
    let tidList = [];
    for(let i=0; i<minogashiList.length; i++){
      if( tidList.indexOf(minogashiList[i].tid) == -1 ){
        tidList.push(minogashiList[i].tid);
      }
    }
    minogashiAnimeListData = minogashiList;
    return animeAbout.getAnimeList(tidList);
  })
  .then((animeList)=>{
    let minogashiAnimeList = assignAnimeAboutAndStory(animeList, minogashiAnimeListData);
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: minogashiAnimeList
    };
    res.send(res_body);
  });
});

module.exports = router;
