"use strict";
const cors = require('cors');

// アニメ概要Listと評価Listをマージして返す
function mergeAnimeInfo(animeAboutList, reviewList) {
  try {
    let animeList = [];
    animeAboutList.map((animeAbout)=>{
      const getReview = reviewList.find((review)=>{
        return review.tid === animeAbout.tid;
      })
      if(getReview) {
        animeList.push( Object.assign(animeAbout.dataValues, getReview.dataValues) );
      }
      else {
        animeList.push( animeAbout.dataValues );
      }
    });
    return animeList;
  }
  catch(e) {
    console.error(e);
    return [];
  }
}

// レビューを1件返す
exports.getOne = (router, animeModel) => {
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
        // アニメ概要がない場合には新規作成する
        if(db_data[1].length) {
          const res_body = {
            status: 'ok',
            body: Object.assign(db_data[0][0].dataValues, db_data[1][0].dataValues)
          };
          res.send(res_body);
        }
        else {
          const res_body = {
            status: 'ng',
            body: "アニメ概要がありません"
          };
          res.send(res_body);
        }
      }
    })
  });
};

// 特定の視聴月に一致するレビューを取得する
exports.getWatchDate = (router, animeModel) => {
  router.get("/getWatchDate/:watchDate", cors(), async (req, res)=>{
    const watchDate = req.params.watchDate;
    const reviewList = await animeModel.review.getWatchDateAnimes(watchDate);
    const tidList = reviewList.map((anime)=>{
      return anime.tid
    });
    const animeAboutList = await animeModel.about.getAnimeList(tidList);
    const animeList = mergeAnimeInfo(animeAboutList, reviewList);
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: animeList
    };
    res.send(res_body);
  });
}

// 特定の得点のアニメレビューを取得する
exports.getRoundRate = (router, animeModel) => {
  router.get("/getRoundRate/:highLimit/:lowLimit", cors(), async (req, res)=>{
    const lowLimit = req.params.lowLimit;
    const highLimit = req.params.highLimit;
    const reviewList = await animeModel.review.getRateAnimeReview(lowLimit, highLimit);
    const tidList = reviewList.map((anime)=>{
      return anime.tid
    });
    const animeAboutList = await animeModel.about.getAnimeList(tidList);
    const animeList = mergeAnimeInfo(animeAboutList, reviewList);
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: animeList
    };
    res.send(res_body);
  });
}

// 全件のレビューを返す
exports.getAll = (router, animeModel) => {
  router.get("/getAllAnimeReview", cors(), async (req, res)=>{
    const reviewList = await animeModel.review.getAllAnimeReview();
    const animeAboutList = await animeModel.about.getAllAnime();
    const animeList = mergeAnimeInfo(animeAboutList, reviewList);
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: animeList
    };
    res.send(res_body);
  });
}