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
        story: null,
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
        type: 'GET',
        url: "./api/getAnimeStoryList/"+params.tid,
        dataType: 'json'
      })
      .done((res)=>{
        if(res['status'] != 'ok'){
          app.error = "該当するアニメがありません。";
          return;
        }
        app.anime = res['body'];
        app.story = app.anime['story'][params.count-1];
        app.message = app.story.comment;
        app.story.showComment = app.story.comment.replace("\n", "\r\n");
        app.anime.animeListURL = "./showAnimeStoryList.html?tid="+app.anime['about'].tid;
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
