(()=>{
  "use strict"
  // Date型整形
  function date_format(date){
    return date.getFullYear().toString() + ('0'+(date.getMonth()+1)).slice(-2) + ('0'+date.getDate()).slice(-2) +
    ('0'+date.getHours()).slice(-2) + ('0'+date.getMinutes()).slice(-2);
  }
  // 実行部分
  let minogashiAnimeList = [];
  // Vue.js
  let app = new Vue({
    el: '#app',
    data: {
      list: minogashiAnimeList
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
          // ローカルでも削除
          this.list = this.list.filter(anime => anime.tid != e.tid);
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
  let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 7,
    endDate.getHours(), endDate.getMinutes());
  let startDateFormat = date_format(startDate);
  // UPSFlag
  let in_url = "./api/getShoboiAnimeAnyDay";
  console.log(in_url);
  $.get(in_url,{
    filter: 1,
    alt: "json",
    usr: userName,
    start: startDateFormat,
    end: endDateFormat
  },(importAnimeSet)=>{
    let AnimeDataSet = [];
    let count = 0;
    for(let i=0;i<importAnimeSet.items.length;i++){
      AnimeDataSet[i] = new AnimeData(i, importAnimeSet.items[i]);
      if(AnimeDataSet[i].getMinogashi() && AnimeDataSet[i].comment === ""){
        let nowPushAnime = AnimeDataSet[i];
        nowPushAnime["id"] = count++;
        minogashiAnimeList.push( nowPushAnime );
      }
    }
  });
})();
