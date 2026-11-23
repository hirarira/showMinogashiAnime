"use strict";
const moment = require('moment');

// アニメの話数情報を更新
// POST /setAnimeStory
exports.setStory = (router, animeModel) => {
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
}

// アニメのレビューを更新
// POST /setAnimeReview
exports.setReview = (router, animeModel) => {
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
}

// アニメの概要を更新
// POST /setAnimeAbout
exports.setAbout = (router, animeModel) => {
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
}


// アニメの視聴ステータスを更新（レビュー行が無ければ作る）
// POST /setAnimeStatus
const VIEW_STATUSES = ['unwatched', 'watching', 'watched', 'stalled', 'dropped'];
exports.setStatus = (router, animeModel) => {
  router.post("/setAnimeStatus", (req, res)=>{
    res.header('Content-Type', 'application/json');
    const status = req.body.status;
    if(!VIEW_STATUSES.includes(status)) {
      let res_body = {
        status: 'ng',
        date: moment(),
        e: '不明なステータスです'
      };
      res.send(res_body);
      return;
    }
    let options = {
      tid: req.body.tid,
      status: status
    };
    animeModel.review.updateStatus(options)
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
}
