(()=>{
  "use strict"
  // Date型整形
  function date_format(date){
    return date.getFullYear().toString() + ('0'+(date.getMonth()+1)).slice(-2) + ('0'+date.getDate()).slice(-2) +
    ('0'+date.getHours()).slice(-2) + ('0'+date.getMinutes()).slice(-2);
  }

  function getAjaxShoboiAnimedata(startDateFormat, endDateFormat, callback){
    // UPSFlag
    let in_url = "./api/getShoboiAnimeAnyDay";
    $.get(in_url, {
      filter: 1,
      alt: "json",
      start: startDateFormat,
      end: endDateFormat
    },(importAnimeSet)=>{
      console.log(importAnimeSet);
      callback();
    });
  }

  // Vue.js
  const app = new Vue({
    el: '#app',
    data: {
      list: [],
      now: null,
      tomorrow: null
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
      },
      searchAnime: function(e) {
        let startDateFormat = date_format(this.now.toDate());
        let endDateFormat = date_format(this.tomorrow.toDate());
        getAjaxShoboiAnimedata(startDateFormat, endDateFormat, ()=>{
          this.getTodayAnime();
        });
      },
      getTodayAnime: function(e) {
        /*
        * しょぼカレ仕様
        * https://sites.google.com/site/syobocal/spec/rss2-php
        *
        */
        this.list = [];
        this.now = moment().add(-5, 'hours');
        this.tomorrow = moment().add(-5, 'hours').add(1, 'days');
        // UPSFlag
        let in_url = `./api/getAnimeAnyDay/${this.now.unix()*1000}/${this.tomorrow.unix()*1000}`;
        $.get(in_url, (importAnimeSet)=>{
          for(let i=0; i<importAnimeSet.body.length; i++){
            this.list.push( new AnimeData(i, importAnimeSet.body[i]) );
          }
        });

        let interID = setInterval(()=>{
          for(let i=0; i<this.list.length; i++){
            this.list[i].setCountDown();
            // console.log(AnimeDataSet[i].countDown );
          }
        },1000);
      }
    }
  });
  app.getTodayAnime();
})();
