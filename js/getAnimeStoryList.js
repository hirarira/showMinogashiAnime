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
        showComment: null
      },
      methods:{
        updateComment: function(){
          $.post("./server/changeStory.php",{
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
          $.post("./server/changeStory.php",{
            tid: e.TID,
            count: e.Count,
            minogashi: e.minogashi == 0?'false':'true',
            comment: e.comment
          },(res)=>{
            console.log(res);
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
