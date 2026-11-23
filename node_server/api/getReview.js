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
    // サムネイルはDBにファイル名だけを持つので、配信URLを組み立てて返す
    const thumbnailBase = process.env.ANIME_THUMBNAIL_BASE_URL || 'https://pollux.hirarira.net/showMinogashiAnime/api/thumbnails/';
    animeList.forEach((anime)=>{
      if(anime.thumbnail && !anime.thumbnail.startsWith('http')){
        anime.thumbnail = thumbnailBase + anime.thumbnail;
      }
    });
    return animeList;
  }
  catch(e) {
    console.error(e);
    return [];
  }
}

// 公開側の一覧・検索では視聴済（watched）の作品だけを返す。
// 個別取得（getAnimeReview）とステータス別取得（getAnimeByStatus）は管理画面でも使うため対象外。
function onlyWatched(animeList) {
  return animeList.filter((anime)=>{
    return anime.status === 'watched';
  });
}

// レビューを1件返す
exports.getOne = (router, animeModel) => {
  router.get("/getAnimeReview/:tid", cors(), (req, res)=>{
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
    const animeList = onlyWatched(mergeAnimeInfo(animeAboutList, reviewList));
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
    const animeList = onlyWatched(mergeAnimeInfo(animeAboutList, reviewList));
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: animeList
    };
    res.send(res_body);
  });
}

// タイトル部分一致でアニメを検索する（概要+レビューのマージ形式で返す）
exports.search = (router, animeModel) => {
  router.get("/searchAnime/:query", cors(), async (req, res)=>{
    res.header('Content-Type', 'application/json');
    const query = (req.params.query || '').trim();
    // 公開エンドポイントなので、短すぎるクエリでの大量取得を防ぐ
    if(query.length < 2) {
      res.send({
        status: 'ng',
        body: '検索クエリは2文字以上で指定してください'
      });
      return;
    }
    let limit = parseInt(req.query.limit, 10);
    if(Number.isNaN(limit) || limit < 1) {
      limit = 50;
    }
    if(limit > 200) {
      limit = 200;
    }
    try {
      // LIKE のワイルドカード（% _ \）はリテラルとして扱う
      const escapedQuery = query.replace(/[\\%_]/g, '\\$&');
      const animeAboutList = await animeModel.about.searchAnimeByTitle(escapedQuery, limit);
      const tidList = animeAboutList.map((anime)=>{
        return anime.tid
      });
      const reviewList = tidList.length ? await animeModel.review.getAnimeReviews(tidList) : [];
      const animeList = onlyWatched(mergeAnimeInfo(animeAboutList, reviewList));
      res.send({
        status: 'ok',
        body: animeList
      });
    }
    catch(e) {
      console.error(e);
      res.send({
        status: 'ng',
        body: '検索に失敗しました'
      });
    }
  });
}

// 全件のレビューを返す
exports.getAll = (router, animeModel) => {
  router.get("/getAllAnimeReview", cors(), async (req, res)=>{
    const reviewList = await animeModel.review.getAllAnimeReview();
    const animeAboutList = await animeModel.about.getAllAnime();
    const animeList = onlyWatched(mergeAnimeInfo(animeAboutList, reviewList));
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: animeList
    };
    res.send(res_body);
  });
}

// 特定の視聴ステータスのアニメを取得する
const VIEW_STATUSES = ['unwatched', 'watching', 'watched', 'stalled', 'dropped'];
exports.getByStatus = (router, animeModel) => {
  router.get("/getAnimeByStatus/:status", cors(), async (req, res)=>{
    res.header('Content-Type', 'application/json');
    const status = req.params.status;
    if(!VIEW_STATUSES.includes(status)) {
      res.send({
        status: 'ng',
        body: '不明なステータスです'
      });
      return;
    }
    const reviewList = await animeModel.review.getAllAnimeReview();
    const animeAboutList = await animeModel.about.getAllAnime();
    const animeList = mergeAnimeInfo(animeAboutList, reviewList);
    const filtered = animeList.filter((anime)=>{
      if(status === 'unwatched') {
        // レビュー行が無い（status を持たない）作品も未視聴に含める
        return anime.status === 'unwatched' || anime.status === undefined || anime.status === null;
      }
      return anime.status === status;
    });
    let res_body = {
      status: 'ok',
      body: filtered
    };
    res.send(res_body);
  });
}
