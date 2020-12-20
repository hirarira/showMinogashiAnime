"use strict";

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
        let res_body = {
          status: 'ok',
          body: Object.assign(db_data[0][0].dataValues, db_data[1][0].dataValues)
        };
        res.send(res_body);
      }
    })
  });
};

// 特定の視聴月に一致するレビューを取得する
exports.getWatchDate = (router, animeModel) => {
  router.get("/getWatchDate/:watchDate", async (req, res)=>{
    const watchDate = req.params.watchDate;
    const reviewList = await animeModel.review.getWatchDateAnimes(watchDate);
    const tidList = reviewList.map((anime)=>{
      return anime.tid
    });
    const animeAboutList = await animeModel.about.getAnimeList(tidList);
    let animeList = [];
    animeAboutList.map((animeAbout)=>{
      const getReview = reviewList.find((review)=>{
        return review.tid === animeAbout.tid;
      })
      animeList.push( Object.assign(animeAbout.dataValues, getReview.dataValues) );
    });
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
}