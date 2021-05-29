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
          minogashi: e.minogashi? 1: 0,
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
  let now = moment().add(-5, 'hours');
  let tomorrow = moment().add(-5, 'hours').add(1, 'days');
  // UPSFlag
  // let in_url_x = "./api/getShoboiAnimeAnyDay";
  let in_url = `./api/getAnimeAnyDay/${now.unix()*1000}/${tomorrow.unix()*1000}`;
  $.get(in_url, (importAnimeSet)=>{
    for(let i=0; i<importAnimeSet.body.length; i++){
      AnimeDataSet.push( new AnimeData(i, importAnimeSet.body[i]) );
    }
  });

  let interID = setInterval(()=>{
    for(let i=0; i<AnimeDataSet.length; i++){
      AnimeDataSet[i].setCountDown();
      // console.log(AnimeDataSet[i].countDown );
    }
  },1000);
})();
