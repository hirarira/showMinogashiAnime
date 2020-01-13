"use strict";
const Express = require("express");
let router = Express.Router();
const Sequelize = require('sequelize');
const AnimeReview = require('./model/animeReview.js');
const AnimeAbout = require('./model/anime.js');
const AnimeStory = require('./model/animeStory.js');
const DBSetting = require('./model/dbSetting.js');

const sequelize = DBSetting();
let moment = require('moment');
let request_promise = require('request-promise');
const parser = require('fast-xml-parser');

let animeReview = new AnimeReview(sequelize);
let animeAbout = new AnimeAbout(sequelize);
let animeStory = new AnimeStory(sequelize);

const username = process.env.ANIME_SHOBOI_CALENDAR_USERNAME;

if(animeReview == null){
  return;
}

// アニメ情報とアニメ各話情報の結合
function assignAnimeAboutAndStory(about, story){
  let minogashiAnimeList = [];
  for(let i=0; i<story.length; i++){
    for(let j=0; j<about.length; j++){
      if(story[i].tid == about[j].tid){
        minogashiAnimeList.push(
           Object.assign(story[i].dataValues, about[j].dataValues)
        );
        break;
      }
    }
  }
  return minogashiAnimeList;
}

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// しょぼいカレンダーより任意の日付の見るアニメを取得
router.get("/getShoboiAnimeAnyDay/", (req, res)=>{
  const shoboiHost = "http://cal.syoboi.jp/";
  const accessURL = shoboiHost + "rss2.php";
  let animeList;
  let options = {
    filter: req.query.filter,
    alt: req.query.alt,
    usr: username,
    start: req.query.start,
    end: req.query.end
  }
  request_promise.get({
    url: accessURL,
    qs: options
  })
  .then((response)=>{
    animeList = JSON.parse(response);
    // アニメのTID_LISTを取得
    let tidlist = [];
    for(let i=0; i<animeList['items'].length; i++){
      tidlist.push(animeList['items'][i].TID);
    }
    return animeAbout.getAnimeList(tidlist);
  })
  .then((response)=>{
    for(let i=0; i<animeList['items'].length; i++){
      let match = null;
      for(let j=0; j<response.length; j++){
        if(animeList['items'][i]['TID'] == response[j]['tid']){
          match = j;
          break;
        }
      }
      // アニメの概要がなければDBに登録
      if(match === null){
        let options = {
          tid: animeList['items'][i]['TID'],
          title: animeList['items'][i]['Title'],
          chName: animeList['items'][i]['ChName'],
          url: animeList['items'][i]['Urls']
        }
        // TODO: ここで正常に挿入できたかPromiseの結果を見たい
        animeAbout.insertAnimeAbout(options);
      }
      // アニメの概要があればDBの情報とマージ
      else{
        animeList['items'][i]['hashTag'] = response[match]['hashTag'];
        animeList['items'][i]['characterURL'] = response[match]['characterURL'];
      }
    }
    let searchStoryList = [];
    for(let i=0; i<animeList['items'].length; i++){
      let story = {}
      story.tid = animeList['items'][i].TID;
      story.count = animeList['items'][i].Count;
      searchStoryList.push(story);
    }
    // 各話の見逃し情報を取得
    return animeStory.getAnimeStories(searchStoryList);
  })
  .then((response)=>{
    // animeStory の見逃し情報を animeListに入れる
    // DB未登録のリスト
    let noRegistrationStoryList = [];
    for(let anime of animeList['items']){
      let isNoMatch = true;
      for(let story of response){
        if(anime.TID == story.dataValues.tid && anime.Count == story.dataValues.count){
          anime.minogashi = story.dataValues.minogashi;
          anime.comment = story.dataValues.comment;
          isNoMatch = false;
          // サブタイが更新されていたらDBを更新する
          if(anime.SubTitle != story.dataValues.subTitle){
            console.log(anime);
            console.log(story.dataValues);
            let options = {
              tid: story.dataValues.tid,
              count: story.dataValues.count,
              subTitle: anime.SubTitle
            }
            console.log(options);
            animeStory.updateSubTitle(options);
          }
          break;
        }
      }
      // DB未登録なら、登録リストに入れておく
      // 話数がnullのアニメは登録しない
      if(isNoMatch && anime.Count != null){
        let ngStory = {
          tid: anime.TID,
          count: anime.Count,
          stTime: anime.StTime,
          edTime: anime.EdTime,
          lastUpdate: anime.LastUpdate,
          subTitle: anime.SubTitle
        }
        noRegistrationStoryList.push(ngStory);
      }
    }
    console.log(noRegistrationStoryList);
    // 未登録のアニメリストをDBに登録する
    animeStory.insertAnimeStories(noRegistrationStoryList);
    // TODO: animeStory のサブタイトルの更新があったらUpdate
    res.header('Content-Type', 'application/json');
    res.send(animeList);
  });
});

// アニメの全話数情報を取得
router.get("/getAnimeStoryList/:tid", (req, res)=>{
  let animePromises = [];
  animePromises.push( animeAbout.getAnime(req.params.tid) );
  animePromises.push( animeStory.getAllAnimeStory(req.params.tid) );
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

// アニメの話数情報を更新
router.post("/setAnimeStory",(req, res)=>{
  let options = {
    tid: req.body.tid,
    count: req.body.count,
    minogashi: req.body.minogashi,
    comment: req.body.comment
  };
  res.header('Content-Type', 'application/json');
  animeStory.setAnimeStory(options)
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

// アニメのレビューを更新
router.post("/setAnimeReview", (req, res)=>{
  let options = {
    tid: req.body.tid,
    rate: req.body.rate,
    comment: req.body.comment,
    watchDate: req.body.watchDate
  };
  res.header('Content-Type', 'application/json');
  animeReview.updateReview(options)
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

// アニメの概要を更新
router.post("/setAnimeAbout", (req, res)=>{
  let options = {
    tid: req.body.tid,
    hashTag: req.body.hashTag,
    characterURL: req.body.characterURL,
    publicURL: req.body.publicURL
  };
  res.header('Content-Type', 'application/json');
  animeAbout.updateAnimeAbout(options)
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

// レビューを1件返す
router.get("/getAnimeReview/:tid", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let animePromises = [];
  animePromises.push( animeReview.getAnimeReview(req.params.tid) );
  animePromises.push( animeAbout.getAnime(req.params.tid) );
  Promise.all(animePromises)
  .then((db_data)=>{
    // レビューがない場合には新規作成する
    if(db_data[0].length == 0){
      return animeReview.initReview(req.params.tid)
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

// 全件のレビューを返す
router.get("/getAllAnimeReview", (req, res)=>{
  let animePromises = [];
  animePromises.push( animeReview.getAllAnimeReview() );
  animePromises.push( animeAbout.getAllAnime() );
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

// 全ての見逃しアニメ情報を取得
router.get("/getAllMinogashiAnime", (req, res)=>{
  let minogashiAnimeListData;
  animeStory.getAllMinogashiStory()
  .then((minogashiList)=>{
    let tidList = [];
    for(let i=0; i<minogashiList.length; i++){
      if( tidList.indexOf(minogashiList[i].tid) == -1 ){
        tidList.push(minogashiList[i].tid);
      }
    }
    minogashiAnimeListData = minogashiList;
    return animeAbout.getAnimeList(tidList);
  })
  .then((animeList)=>{
    let minogashiAnimeList = assignAnimeAboutAndStory(animeList, minogashiAnimeListData);
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: minogashiAnimeList
    };
    res.send(res_body);
  });
});

// 過去一週間の見逃しアニメ情報を取得
router.get("/getWeekMinogashiAnime", (req, res)=>{
  let minogashiAnimeListData;
  let lastWeek = moment().subtract(7, 'days').startOf('day');
  animeStory.getWeekMinogashiAnime(lastWeek)
  .then((minogashiList)=>{
    let tidList = [];
    for(let i=0; i<minogashiList.length; i++){
      if( tidList.indexOf(minogashiList[i].tid) == -1 ){
        tidList.push(minogashiList[i].tid);
      }
    }
    minogashiAnimeListData = minogashiList;
    return animeAbout.getAnimeList(tidList);
  })
  .then((animeList)=>{
    let minogashiAnimeList = assignAnimeAboutAndStory(animeList, minogashiAnimeListData);
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: minogashiAnimeList
    };
    res.send(res_body);
  });
});

// 未登録のアニメのサブタイを取得して登録
router.get("/getNoRegistStories/:tid", (req, res)=>{
  const base_url = "http://cal.syoboi.jp/db.php?Command=TitleLookup&TID=";
  const tid = req.params.tid;
  const url = base_url + tid;
  let storyList = [];
  let baseStory = {
    tid: tid,
    count: null,
    stTime: 0,
    edTime: 0,
    lastUpdate: 0,
    subTitle: ''
  }
  // ベースとなるレスポンス
  let res_body = {
    status: 'ok',
    comment: '',
    regStories: []
  };

  request_promise.get({
    url: url
  })
  .then((stories)=>{
    let json = parser.parse(stories);
    let titleItem = json['TitleLookupResponse']['TitleItems']['TitleItem'];
    let subTitleLines = titleItem['SubTitles'].split("\r\n");
    for(let i in subTitleLines){
      storyList.push( subTitleLines[i].split(/\*(.*?)\*/).filter(e => e) );
    }
    return animeStory.getAllAnimeStory(tid);
  })
  .then((noRegStoriesDefault)=>{
    res.header('Content-Type', 'application/json');
    let registStoryList = noRegStoriesDefault.map(x => x['dataValues']);
    let existStoryList = registStoryList.map(x => x['count']);
    // 1話も登録されていない場合にはエラーとする
    if(existStoryList.length <= 0){
      return 1;
    }
    let noRegStories = [];
    let updateStories = [];
    for(let i=0; i<storyList.length; i++){
      // DB上に含まれてるかチェック
      storyList[i][0] = Number(storyList[i][0])
      if(existStoryList.indexOf( storyList[i][0] ) == -1){
        let noRegStory = Object.assign({}, baseStory);
        noRegStory['count'] = storyList[i][0];
        noRegStory['subTitle'] = storyList[i][1];
        noRegStories.push(noRegStory);
      }
      else{
        // DB上のサブタイが最新のものかチェック
        let registedStory = registStoryList.find(x => x.count == storyList[i][0]);
        // DB上のサブタイとAPI取得のサブタイが異なる場合
        if(registedStory && (storyList[i][1] != registedStory.subTitle)){
          updateStories.push({
            tid: registedStory.tid,
            count: registedStory.count,
            subTitle: storyList[i][1]
          });
        }
      }
    }
    // 登録するアニメがない場合
    if(noRegStories.length == 0 && updateStories.length == 0){
      return 2;
    }
    else{
      for(let i=0; i<updateStories.length; i++){
        // アニメのサブタイを更新（返り値は無視）
        animeStory.updateSubTitle(updateStories[i]);
      }
      if(noRegStories.length != 0){
        res_body['regStories'] = noRegStories;
        return animeStory.insertAnimeStories(noRegStories);
      }
    }
  })
  .then((regResult)=>{
    switch (regResult) {
      case 1:
        res.status(400);
        res_body['status'] = 'ng';
        res_body['comment'] = 'The anime is unregistered';
        break;
      case 2:
        res_body['comment'] = 'There is no anime to register';
        break;
      default:
        res_body['comment'] = 'All registered successfully';
      break;
    }
    res_body['date'] = new Date();
    res.send(res_body);
  });
});

module.exports = router;
