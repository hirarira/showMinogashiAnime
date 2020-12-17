"use strict";
const moment = require('moment');
const lib = require('./lib');

/**
 * 見逃しアニメに関するルーティングを実装する
 */

// 過去一週間の見逃しアニメ情報を取得
exports.getWeek = (router, animeModel) => {
  router.get("/getWeekMinogashiAnime", (req, res)=>{
    let minogashiAnimeListData;
    const lastWeek = moment().subtract(7, 'days').startOf('day');
    animeModel.story.getWeekMinogashiAnime(lastWeek)
    .then((minogashiList)=>{
      let tidList = [];
      for(let i=0; i<minogashiList.length; i++){
        if( tidList.indexOf(minogashiList[i].tid) == -1 ){
          tidList.push(minogashiList[i].tid);
        }
      }
      minogashiAnimeListData = minogashiList;
      return animeModel.about.getAnimeList(tidList);
    })
    .then((animeList)=>{
      let minogashiAnimeList = lib.assignAnimeAboutAndStory(animeList, minogashiAnimeListData);
      res.header('Content-Type', 'application/json');
      let res_body = {
        status: 'ok',
        body: minogashiAnimeList
      };
      res.send(res_body);
    });
  });
}

// 全ての見逃しアニメ情報を取得
exports.getAll = (router, animeModel) => {
  router.get("/getAllMinogashiAnime", (req, res)=>{
    let minogashiAnimeListData;
    animeModel.story.getAllMinogashiStory()
    .then((minogashiList)=>{
      let tidList = [];
      for(let i=0; i<minogashiList.length; i++){
        if( tidList.indexOf(minogashiList[i].tid) == -1 ){
          tidList.push(minogashiList[i].tid);
        }
      }
      minogashiAnimeListData = minogashiList;
      return animeModel.about.getAnimeList(tidList);
    })
    .then((animeList)=>{
      const minogashiAnimeList = lib.assignAnimeAboutAndStory(animeList, minogashiAnimeListData);
      res.header('Content-Type', 'application/json');
      const res_body = {
        status: 'ok',
        body: minogashiAnimeList
      };
      res.send(res_body);
    });
  });
}

