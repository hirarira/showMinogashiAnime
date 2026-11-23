"use strict";
const moment = require('moment');
const fs = require('fs');
const path = require('path');

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

// サムネイル画像の保存先と制限（画像そのものはDBに入れず、ファイル名だけを anime.thumbnail に持つ）
const THUMBNAIL_DIR = path.join(__dirname, '..', 'thumbnails');
const THUMBNAIL_MAX_SIZE = 4 * 1024 * 1024;
const THUMBNAIL_EXTS = ['jpg', 'png', 'webp', 'gif'];

// 画像形式をマジックバイトで判定する（判定できなければ null）
function detectThumbnailExt(buf){
  if(buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'jpg';
  if(buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'png';
  if(buf.length >= 4 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'gif';
  if(buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

// サムネイル画像を保存する
// POST /setAnimeThumbnail {tid, dataBase64}
exports.setThumbnail = (router, animeModel) => {
  router.post("/setAnimeThumbnail", async (req, res)=>{
    res.header('Content-Type', 'application/json');
    const sendNg = (message)=>{
      res.send({ status: 'ng', date: moment(), message: message });
    };
    try {
      const tid = Number(req.body.tid);
      if(!Number.isInteger(tid) || tid <= 0 || typeof req.body.dataBase64 !== 'string'){
        sendNg('invalid params');
        return;
      }
      const buf = Buffer.from(req.body.dataBase64, 'base64');
      if(buf.length === 0 || buf.length > THUMBNAIL_MAX_SIZE){
        sendNg('invalid image size');
        return;
      }
      const ext = detectThumbnailExt(buf);
      if(!ext){
        sendNg('unsupported image type');
        return;
      }
      const rows = await animeModel.about.getAnime(tid);
      if(!rows || rows.length === 0){
        sendNg('anime not found');
        return;
      }
      const fileName = tid + '.' + ext;
      fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
      // 拡張子の違う旧ファイルを消してから新しいファイルを書く
      THUMBNAIL_EXTS.forEach((e)=>{
        if(e !== ext){
          try { fs.unlinkSync(path.join(THUMBNAIL_DIR, tid + '.' + e)); } catch(e2) {}
        }
      });
      fs.writeFileSync(path.join(THUMBNAIL_DIR, fileName), buf);
      await animeModel.about.updateThumbnail(fileName, tid);
      res.send({ status: 'ok', date: moment(), thumbnail: fileName });
    }
    catch(e) {
      res.send({ status: 'ng', date: moment(), e: String(e) });
    }
  });
}

// サムネイル画像を削除する
// POST /deleteAnimeThumbnail {tid}
exports.deleteThumbnail = (router, animeModel) => {
  router.post("/deleteAnimeThumbnail", async (req, res)=>{
    res.header('Content-Type', 'application/json');
    try {
      const tid = Number(req.body.tid);
      if(!Number.isInteger(tid) || tid <= 0){
        res.send({ status: 'ng', date: moment(), message: 'invalid params' });
        return;
      }
      THUMBNAIL_EXTS.forEach((e)=>{
        try { fs.unlinkSync(path.join(THUMBNAIL_DIR, tid + '.' + e)); } catch(e2) {}
      });
      await animeModel.about.updateThumbnail(null, tid);
      res.send({ status: 'ok', date: moment() });
    }
    catch(e) {
      res.send({ status: 'ng', date: moment(), e: String(e) });
    }
  });
}
