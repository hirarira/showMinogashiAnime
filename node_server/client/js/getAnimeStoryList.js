(()=>{
  "use strict";
  window.onload = (()=>{
    let nowURL = location.href;
    let paramsStr = nowURL.split("?")[1];
    const needParams = 'tid';
    let params = {};
    let app = new Vue({
      el: '#app',
      data:{
        params: params,
        error: null,
        anime: null,
        message: null,
        showComment: null,
        review: null,
        loading: true,
        changeResult: null,
        sb_url: null,
        tid: null,
        hashTag: null,
        publicURL: null,
        characterURL: null,
        getShoboiReult: null,
        errorMessage: null
      },
      methods:{
        updateComment: function(){
          $.post("./api/setAnimeStory",{
            tid: this.anime.about.tid,
            count: this.anime.count,
            minogashi: e.minogashi? 1: 0,
            comment: this.message
          },(res)=>{
            this.anime.comment = this.message;
          });
        },
        changeMinogashi: function(e){
          e.minogashi = e.minogashi == 0? 1: 0;
          $.post("./api/setAnimeStory",{
            tid: e.tid,
            count: e.count,
            minogashi: e.minogashi? 1: 0,
            comment: e.comment
          })
          .done((res)=>{
            console.log(res);
          });
        },
        updateReview: function(){
          $.post("./api/setAnimeReview",{
            tid: this.review.tid,
            rate: this.review.rate,
            number: this.review.number,
            comment: this.review.comment,
            watchDate: this.review.watchDate
          },(res)=>{
            this.changeResult = res;
          });
        },
        // アニメ基本情報の更新をする
        updateAnimeAbout: function(e){
          $.post("./api/setAnimeAbout",{
            tid: this.tid,
            hashTag: this.hashTag,
            characterURL: this.characterURL,
            publicURL: this.publicURL
          },(res)=>{
            console.log(res);
          });
        },
        // アニメの各話情報の取得と収集をする
        getNoRegistStories: function(e){
          $.get(`./api/getNoRegistStories/${this.tid}`, (res)=>{
            this.getShoboiReult = res;
          });
        }
      }
    });

    try{
      if(typeof paramsStr === 'undefined'){
        throw new Error("必要なパラメータ"+needParams+"がないです");
      }
      let allParam = paramsStr.split("&");
      for(let i=0; i<allParam.length; i++){
        params[ allParam[i].split('=')[0] ] = allParam[i].split('=')[1];
      }
      if(typeof params[needParams] === 'undefined'){
        throw new Error("必要なパラメーター["+needParams[param]+"]がないです");
      }
      app.sb_url = "http://cal.syoboi.jp/tid/" + params.tid;
      app.tid = params.tid;
      // Ajaxで該当するのを取得
      $.ajax({
        type: 'GET',
        url: "./api/getAnimeStoryList/"+params.tid,
        dataType: 'json'
      })
      .done((res)=>{
        if( res.status !== 'ok' || !res.body.about ){
          app.error = "該当するアニメがありません。";
          return;
        }
        app.anime = res.body;
        for(let i=0; i<app.anime.story.length; i++){
          app.anime.story[i].commentURL = "./setComment.html?tid="+app.anime.story[i].tid+"&count="+app.anime.story[i].count;
          app.anime.story[i].startTime = new Date(Number(app.anime.story[i].stTime * 1000));
          if(app.anime.story[i].subTitle === '' || app.anime.story[i].subTitle === null){
            app.anime.story[i].subTitle = '(サブタイなし)';
          }
        }
        $.ajax({
          type: 'GET',
          url: "./api/getAnimeReview/"+params.tid,
          dataType: 'json'
        })
        .then((res)=>{
          app.review = res['body'];
          app.loading = false;
        });
        // 基礎情報を入れていく
        if(app.anime && app.anime.about) {
          app.tid = app.anime.about.tid;
          app.hashTag = app.anime.about.hashTag;
          app.publicURL = app.anime.about.publicURL == "" ?
            app.anime.about.url.split('	')['about']:
            app.anime.about.publicURL;
          app.characterURL = app.anime.about.characterURL;
        }
        else {
          app.tid = params.tid;
          app.error = "アニメ概要情報がありません！";
        }
      })
      .fail((e)=>{
        app.error = e.toString();
      });
    }
    catch(e){
      app.error = e.toString();
    };
  });
})();
