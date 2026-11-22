"use strict";
const username = process.env.ANIME_SHOBOI_CALENDAR_USERNAME;
const { XMLParser } = require('fast-xml-parser');
const parser = new XMLParser();

/**
 * しょぼいカレンダーAPIにアクセスするルーティングを実装する
 */
 // しょぼいカレンダーより任意の日付の見るアニメを取得
exports.getAnyDay = (router, animeModel) => {
  router.post("/getShoboiAnimeAnyDay/", (req, res)=>{
    const shoboiHost = "http://cal.syoboi.jp/";
    const accessURL = shoboiHost + "rss2.php";
    let animeList;
    // パラメータは JSON ボディで受け取る（互換のためクエリでも可、ボディ優先）
    const params = Object.assign({}, req.query, req.body);
    let options = {
      filter: params.filter,
      alt: params.alt,
      usr: username,
      start: params.start,
      end: params.end
    }
    const query = new URLSearchParams();
    for(const key of Object.keys(options)){
      if(options[key] !== undefined && options[key] !== null){
        query.set(key, options[key]);
      }
    }
    fetch(accessURL + "?" + query.toString())
    .then((response)=>{
      return response.json();
    })
    .then((response)=>{
      animeList = response;
      // アニメのTID_LISTを取得
      let tidlist = [];
      for(let i=0; i<animeList['items'].length; i++){
        tidlist.push(animeList['items'][i].TID);
      }
      return animeModel.about.getAnimeList(tidlist);
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
          const options = {
            tid: animeList['items'][i]['TID'],
            title: animeList['items'][i]['Title'],
            chName: animeList['items'][i]['ChName'],
            url: animeList['items'][i]['Urls']
          }
          // TODO: ここで正常に挿入できたかPromiseの結果を見たい
          animeModel.about.insertAnimeAbout(options);
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
      return animeModel.story.getAnimeStories(searchStoryList);
    })
    .then((response)=>{
      // animeStory の見逃し情報を animeListに入れる
      // DB未登録のリスト
      let noRegistrationStoryList = [];
      for(let anime of animeList['items']){
        // subTitleはnullの場合があるので対応
        const registAnimeSubTitle = anime.SubTitle? anime.SubTitle: '';
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
                subTitle: registAnimeSubTitle
              }
              console.log(options);
              animeModel.story.updateSubTitle(options);
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
            subTitle: registAnimeSubTitle
          }
          noRegistrationStoryList.push(ngStory);
        }
      }
      console.log(noRegistrationStoryList);
      // 未登録のアニメリストをDBに登録する
      animeModel.story.insertAnimeStories(noRegistrationStoryList);
      // TODO: animeStory のサブタイトルの更新があったらUpdate
      res.header('Content-Type', 'application/json');
      res.send(animeList);
    })
    .catch((e)=>{
      // 取得やパースに失敗してもサーバーを落とさず、エラーを返す
      console.error(e);
      res.header('Content-Type', 'application/json');
      res.status(500);
      res.send({status: 'ng', comment: 'しょぼいカレンダーからの取得に失敗しました'});
    });
  });
}

class AnimeRegistError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
  }
}

// 未登録のアニメのサブタイを取得して登録
exports.getNoRegistStories = async (router, animeModel) => {
  router.post("/getNoRegistStories/:tid", async (req, res)=>{
    try {
      const base_url = "http://cal.syoboi.jp/db.php?Command=TitleLookup&TID=";
      const tid = req.params.tid;
      if(Number.isNaN(Number(tid))) {
        throw new AnimeRegistError(`TIDの値が異常です: ${tid}`, 0);
      }
      const url = base_url + tid;
      const storyList = [];
      const baseStory = {
        tid: tid,
        count: null,
        stTime: 0,
        edTime: 0,
        lastUpdate: 0,
        subTitle: ''
      }
      // ベースとなるレスポンス
      const res_body = {
        status: 'ok',
        comment: '',
        regStories: []
      };

      const stories = await (await fetch(url)).text();
      const json = parser.parse(stories);
      if(!json.TitleLookupResponse || !json.TitleLookupResponse.TitleItems) {
        console.log(json);
        throw new AnimeRegistError("json.TitleLookupResponse 要素がありません", 3);
      }
      if(json.TitleLookupResponse.Result && json.TitleLookupResponse.Result.Code === 400) {
        console.log("url:");
        console.log(url);
        throw new AnimeRegistError(json.TitleLookupResponse.Result.Message, 4);
      }
      const titleItem = json.TitleLookupResponse.TitleItems.TitleItem;
      // XMLパーサーは改行を \n に正規化するため、\r\n と \n のどちらにも対応する
      const subTitleLines = (titleItem.SubTitles || '').split(/\r\n|\r|\n/);
      for(let i in subTitleLines){
        if(!subTitleLines[i]) {
          continue;
        }
        storyList.push( subTitleLines[i].split(/\*(.*?)\*/).filter(e => e) );
      }
      const noRegStoriesDefault = await animeModel.story.getAllAnimeStory(tid);
      res.header('Content-Type', 'application/json');
      let registStoryList = noRegStoriesDefault.map(x => x['dataValues']);
      let existStoryList = registStoryList.map(x => x['count']);
      // アニメ概要が未登録の場合のみ登録する
      // （登録済みの概要を再登録すると一意制約違反でエラーになるため）
      const existAbout = await animeModel.about.getAnime(tid);
      if(existAbout.length <= 0){
        const noRegistAnimeAbout = {
          tid: titleItem.TID,
          title: titleItem.Title,
          chName: "",
          url: ""
        }
        await animeModel.about.insertAnimeAbout(noRegistAnimeAbout);
      }
      let noRegStories = [];
      let updateStories = [];
      for(let i=0; i<storyList.length; i++){
        // DB上に含まれてるかチェック
        storyList[i][0] = Number(storyList[i][0])
        if(Number.isNaN(storyList[i][0])){
          continue;
        }
        const storySubTitle = storyList[i][1] || '';
        if(existStoryList.indexOf( storyList[i][0] ) == -1){
          let noRegStory = Object.assign({}, baseStory);
          noRegStory['count'] = storyList[i][0];
          noRegStory['subTitle'] = storySubTitle;
          noRegStories.push(noRegStory);
        }
        else{
          // DB上のサブタイが最新のものかチェック
          let registedStory = registStoryList.find(x => x.count == storyList[i][0]);
          // DB上のサブタイとAPI取得のサブタイが異なる場合
          if(registedStory && (storySubTitle != registedStory.subTitle)){
            updateStories.push({
              tid: registedStory.tid,
              count: registedStory.count,
              subTitle: storySubTitle
            });
          }
        }
      }
      // 登録・更新する話数がない場合は正常系として返す
      if(noRegStories.length == 0 && updateStories.length == 0){
        res_body['comment'] = '登録・更新する話数はありませんでした';
      }
      else{
        for(let i=0; i<updateStories.length; i++){
          // アニメのサブタイを更新
          await animeModel.story.updateSubTitle(updateStories[i]);
        }
        if(noRegStories.length != 0){
          res_body['regStories'] = noRegStories;
          await animeModel.story.insertAnimeStories(noRegStories);
        }
        res_body['comment'] = 'All registered successfully';
      }
      res_body['date'] = new Date();
      res.send(res_body);
    }
    catch(e) {
      console.error(e);
      res.status(500);
      if(e instanceof AnimeRegistError) {
        const res_body = {
          status: 'ng',
          comment: e.message,
          code: e.errorCode,
          date: new Date()
        };
        res.send(res_body);
      }
      else {
        const res_body = {
          status: 'ng',
          comment: '予想外のエラーが発生しました',
          date: new Date()
        };
        res.send(res_body);
      }
    }
  });
}
