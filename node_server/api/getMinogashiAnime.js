"use strict";
const moment = require('moment');
const lib = require('./lib');
// import { assignAnimeAboutAndStory } from './api';

exports.getWeek = (router, animeModel) => {
  // 過去一週間の見逃しアニメ情報を取得
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

