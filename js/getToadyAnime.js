(()=>{
  "use strict"
  // Date型整形
  function date_format(date){
    return date.getFullYear().toString() + ('0'+(date.getMonth()+1)).slice(-2) + ('0'+date.getDate()).slice(-2) +
    ('0'+date.getHours()).slice(-2) + ('0'+date.getMinutes()).slice(-2);
  }
  // 実行部分
  let AnimeDataSet = [];
  // Vue.js
  let app = new Vue({
    el: '#app',
    data: {
      list: AnimeDataSet
    },
    methods:{
      minogashi: function(url){
        return url;
      },
      changeMinogashi: function(e){
        e.minogashi = !e.minogashi;
        $.post("./server/changeStory.php",{
          tid: e.tid,
          count: e.count,
          minogashi: e.minogashi,
          comment: e.comment
        },(res)=>{
          console.log(res);
        });
      }
    }
  });
  /*
   * しょぼカレ仕様
   * https://sites.google.com/site/syobocal/spec/rss2-php
   *
   */
  // UPSFlag
  let in_url = "./server/server.php/getShoboi";
  console.log(in_url);
  $.get(in_url,{
    filter: 1,
    alt: "json",
    usr: userName,
    start: null,
    end: null
  },(importAnimeSet)=>{
    for(let i=0;i<importAnimeSet.items.length;i++){
      AnimeDataSet.push( new AnimeData(i, importAnimeSet.items[i]) );
    }
  });

  let interID = setInterval(()=>{
    for(let i=0; i<AnimeDataSet.length; i++){
      AnimeDataSet[i].setCountDown();
      // console.log(AnimeDataSet[i].countDown );
    }
  },1000);
})();
