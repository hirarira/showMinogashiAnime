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
        $.post("./api/setAnimeStory",{
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
  // 今日の日付
  let endDate = new Date();
  let endDateFormat = date_format(endDate);
  // 開始時日付
  let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1, endDate.getHours(), endDate.getMinutes());
  let startDateFormat = date_format(startDate);
  // UPSFlag
  let in_url = "./server/server.php/getShoboi";
  console.log(in_url);
  $.get(in_url,{
    filter: 1,
    alt: "json",
    usr: userName,
    start: startDateFormat,
    end: endDateFormat
  },(importAnimeSet)=>{
    for(let i=0;i<importAnimeSet.items.length;i++){
      AnimeDataSet.push( new AnimeData(i, importAnimeSet.items[i]) );
    }
    console.log(AnimeDataSet);
  });
})();
