"use strict";

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