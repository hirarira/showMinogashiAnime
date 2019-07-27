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
          $.post("./api/setAnimeStory",{
            tid: this.anime.about.tid,
            count: this.story.count,
            minogashi: this.story.minogashi,
            comment: this.message
          },(res)=>{
            this.story.comment = this.message;
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
        let idx = null;
        for(let i=0; i<app.anime['story'].length; i++){
          if(app.anime['story'][i].count == app.params['count']){
            idx = i;
            break;
          }
        }
        if(idx == null){
          throw new Error("そんな話数は存在しません。");
        }
        app.story = app.anime['story'][idx];
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
