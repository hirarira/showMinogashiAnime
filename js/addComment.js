(()=>{
  "use strict";
  window.onload = (()=>{
    let nowURL = location.href;
    let paramsStr = nowURL.split("?")[1];
    const needParams = ['tid', 'count'];
    let params = {};
    let app = new Vue({
      el: '#app',
      data:{
        params: params,
        error: null,
        anime: null,
        message: null,
        showComment: null
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
      for(let param in needParams){
        if(typeof params[needParams[param]] === 'undefined'){
          throw new Error("必要なパラメーター["+needParams[param]+"]がないです");
        }
      }
      // Ajaxで該当するのを取得
      $.ajax({
        type: 'POST',
        url: "./server/getAnime.php",
        data: {
          tid: params.tid,
          count: params.count
        },
        dataType: 'json'
      })
      .done((res)=>{
        if(res.length === 0){
          app.error = "該当するアニメがありません。";
          return;
        }
        app.anime = res[0];
        app.message = app.anime.comment;
        app.showComment = app.anime.comment.replace("\n", "\r\n");
        app.anime.animeListURL = "./showAnimeStoryList.html?tid="+app.anime.TID;
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
