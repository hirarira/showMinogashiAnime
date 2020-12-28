"use strict";
const moment = require('moment');

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
    let animeData = await animeModel.story.getAnyTimeAnimeStories(start, end);
    animeData = animeData.map((anime)=>{ return anime.dataValues });
    console.log(animeData);
    res.header('Content-Type', 'application/json');
      let res_body = {
        status: 'ok',
        body: animeData
      };
      res.send(res_body);
  });
}
