"use strict";
const Express = require("express");
const BodyParser = require('body-parser');
const Sequelize = require('sequelize');
const AnimeReview = require('./model/animeReview.js');
const AnimeAbout = require('./model/anime.js');
const AnimeStory = require('./model/animeStory.js');
const DBSetting = require('./model/dbSetting.js');
let moment = require('moment');
const app = Express();
const sequelize = DBSetting();

let animeReview = new AnimeReview(sequelize);
let animeAbout = new AnimeAbout(sequelize);
let animeStory = new AnimeStory(sequelize);

if(animeReview == null){
  return;
}

// urlencodedとjsonは別々に初期化する
app.use(BodyParser.urlencoded({
    extended: true
}));
app.use(BodyParser.json());

let server = app.listen(3333, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.get("/test", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let res_body = { status: 'ok' };
  res.send(res_body);
});

app.get("/getAnimeStoryList/:tid", (req, res)=>{
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

// レビューを1件返す
app.get("/getAnimeReview/:tid", (req, res)=>{
  let animePromises = [];
  animePromises.push( animeReview.getAnimeReview(req.params.tid) );
  animePromises.push( animeAbout.getAnime(req.params.tid) );
  Promise.all(animePromises)
  .then((db_data)=>{
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: Object.assign(db_data[0][0].dataValues, db_data[1][0].dataValues)
    };
    res.send(res_body);
  });
});

// 全件のレビューを返す
app.get("/getAllAnimeReview", (req, res)=>{
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

// 全ての見逃しアニメ情報を取得
app.get("/getAllMinogashiAnime", (req, res)=>{
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
app.get("/getWeekMinogashiAnime", (req, res)=>{
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

// 404
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  let res_body = {
    status: 'ng',
    body: '404 not found'
  };
  res.status(404).send(res_body);
});
