(()=>{
  "use strict"
  // Date型整形
  function date_format(date){
    return date.getFullYear().toString() + ('0'+(date.getMonth()+1)).slice(-2) + ('0'+date.getDate()).slice(-2) +
    ('0'+date.getHours()).slice(-2) + ('0'+date.getMinutes()).slice(-2);
  }

  function getAjaxAnimedata(start, end, AnimeDataSet){
    AnimeDataSet.splice(0, AnimeDataSet.length);
    // UPSFlag
    let in_url = `./api/getAnimeAnyDay/${start.getTime()}/${end.getTime()}`;
    $.get(in_url ,(importAnimeSet)=>{
      for(let i=0;i<importAnimeSet.body.length;i++){
        AnimeDataSet.push( new AnimeData(i, importAnimeSet.body[i]) );
      }
    });
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

  window.onload = (()=>{
    const START_DATE = 5;
    let app = new Vue({
      el: '#app',
      data: {
        list: [],
        startDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate() - 1
        ),
        endDate: new Date(),
        youbi: ["日","月","火","水","木","金","土"],
        setDate: new Date().getFullYear()+"-"+Number(new Date().getMonth()+1)+"-"+new Date().getDate()
      },
      methods:{
        minogashi: function(url){
          return url;
        },
        setDateFunc: function(e) {
          this.startDate = new Date(
            this.setDate.split("-")[0],
            this.setDate.split("-")[1] - 1,
            this.setDate.split("-")[2],
            START_DATE
          );
          this.endDate = new Date(
            this.startDate.getFullYear(),
            this.startDate.getMonth(),
            this.startDate.getDate() + 1,
            this.startDate.getHours()
          );
        },
        beforeDay: function(e){
          this.startDate.setDate(this.startDate.getDate() - 1);
          this.endDate.setDate(this.endDate.getDate() - 1);
          this.getAjax();
        },
        afterDay : function(e){
          this.startDate.setDate(this.startDate.getDate() + 1);
          this.endDate.setDate(this.endDate.getDate() + 1);
          this.getAjax();
        },
        beforeWeek: function(e){
          this.startDate.setDate(this.startDate.getDate() - 7);
          this.endDate.setDate(this.endDate.getDate() - 7);
          this.getAjax();
        },
        afterWeek : function(e){
          this.startDate.setDate(this.startDate.getDate() + 7);
          this.endDate.setDate(this.endDate.getDate() + 7);
          this.getAjax();
        },
        searchAnime: function(e){
          console.log(this.setDate);
          this.setDateFunc();
          this.getAjax();
        },
        getAjax: function(){
          getAjaxAnimedata(this.startDate, this.endDate, this.list);
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
        getShoboi: function(e) {
          let startDateFormat = date_format(this.startDate);
          let endDateFormat = date_format(this.endDate);
          getAjaxShoboiAnimedata(startDateFormat, endDateFormat, ()=>{
            getAjaxAnimedata(this.startDate, this.endDate, this.list);
          });
        }
      }
    });
    app.searchAnime();
  })();
})();
