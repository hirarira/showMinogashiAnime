"use strict";
const moment = require('moment');
const lib = require('./lib');

// アニメの全話数情報を取得
exports.getAnyDay = (router, animeModel) => {
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
}

// 本日放送のアニメ情報を返す
exports.getNowAnime = (router, animeModel) => {
  router.get("/getNowAnime/:limit", async (req, res)=>{
    const now = moment();
    const limit = req.params.limit;
    const start = moment(now).add('minutes', 1);
    const end = moment(now).add('minutes', limit);
    const animeData = await animeModel.story.getAnyTimeAnimeStories(start, end);
    const tidList = animeData.map((anime)=>{ return anime.tid });
    const animeAbout = await animeModel.about.getAnimeList(tidList);
    let animeConect = lib.assignAnimeAboutAndStory(animeAbout, animeData);
    animeConect = animeConect.map((anime)=>{
      anime.limitSecond = anime.stTime - now.unix();
      return anime;
    })
    res.header('Content-Type', 'application/json');
      let res_body = {
        status: 'ok',
        body: animeConect
      };
      res.send(res_body);
  });
}

// 任意の時刻のアニメ情報を返すエンドポイント
exports.getNowAnime = (router, animeModel) => {
  router.get("/getAnimeAnyDay/:start/:end", async (req, res)=>{
    const now = moment();
    const startQuery = req.params.start;
    const endQuery = req.params.end;
    const start = moment(new Date(Number(startQuery)));
    const end = moment(new Date(Number(endQuery)));
    const animeData = await animeModel.story.getAnyTimeAnimeStories(start, end);
    const tidList = animeData.map((anime)=>{ return anime.tid });
    const animeAbout = await animeModel.about.getAnimeList(tidList);
    let animeConect = lib.assignAnimeAboutAndStory(animeAbout, animeData);
    animeConect = animeConect.map((anime)=>{
      anime.limitSecond = anime.stTime - now.unix();
      return anime;
    })
    res.header('Content-Type', 'application/json');
      let res_body = {
        status: 'ok',
        body: animeConect
      };
      res.send(res_body);
  });
}
