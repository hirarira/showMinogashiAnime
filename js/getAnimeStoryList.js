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
        hashTag: null,
        publicURL: null,
        characterURL: null
      },
      methods:{
        updateComment: function(){
          $.post("./server/server.php/changeStory",{
            tid: this.anime.tid,
            count: this.anime.Count,
            minogashi: this.anime.minogashi == 0 ? 'false': 'true',
            comment: this.message
          },(res)=>{
            this.anime.comment = this.message;
          });
        },
        changeMinogashi: function(e){
          e.minogashi = e.minogashi == 0?1:0;
          $.post("./server/server.php/changeStory",{
            tid: e.TID,
            count: e.Count,
            minogashi: e.minogashi == 0?'false':'true',
            comment: e.comment
          },(res)=>{
            console.log(res);
          });
        },
        updateReview: function(){
          $.post("./server/postAnimeReview.php",{
            tid: this.review.TID,
            rank: this.review.評価,
            number: this.review.話数,
            comment: this.review.コメント
          },(res)=>{
            this.changeResult = res;
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
      // Ajaxで該当するのを取得
      $.ajax({
        type: 'POST',
        url: "./server/getAnimeList.php",
        data: {
          tid: params.tid
        },
        dataType: 'json'
      })
      .done((res)=>{
        if(res.length === 0){
          app.error = "該当するアニメがありません。";
          return;
        }
        app.anime = res;
        app.anime.sort((a,b)=>{
          if( Number(a.Count) < Number(b.Count) ) return -1;
          if( Number(a.Count) > Number(b.Count) ) return 1;
          return 0;
        });
        for(let i=0; i<app.anime.length; i++){
          app.anime[i].commentURL = "./setComment.html?tid="+app.anime[i].TID+"&count="+app.anime[i].Count;
          app.anime[i].startTime = new Date(Number(app.anime[i].StTime * 1000));
          if(app.anime[i].SubTitle === ''　|| app.anime[i].SubTitle === null){
            app.anime[i].SubTitle = '(サブタイなし)';
          }
        }
        $.ajax({
          type: 'GET',
          url: "./server/getAnimeReview.php",
          data: {
            tid: params.tid
          },
          dataType: 'json'
        })
        .then((res)=>{
          app.review = res[0];
          app.loading = false;
        });
        // 基礎情報を入れていく
        app.hashTag = app.anime[0].hashTag;
        app.publicURL = app.anime[0].url.split('	')[0];
        app.characterURL = app.anime[0].characterURL;
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
