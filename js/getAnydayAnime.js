(()=>{
  "use strict"
  // Date型整形
  function date_format(date){
    return date.getFullYear().toString() + ('0'+(date.getMonth()+1)).slice(-2) + ('0'+date.getDate()).slice(-2) +
    ('0'+date.getHours()).slice(-2) + ('0'+date.getMinutes()).slice(-2);
  }

  function getAjaxAnimedata(startDateFormat, endDateFormat, AnimeDataSet){
    AnimeDataSet.splice(0, AnimeDataSet.length);
    // UPSFlag
    let userName = "hirarira617";
    let in_url = "./server/getShoboi.php";
    $.get(in_url,{
      filter: 1,
      alt: "json",
      usr: userName,
      start: startDateFormat,
      end: endDateFormat
    },(importAnimeSet)=>{
      console.log(importAnimeSet);
      for(let i=0;i<importAnimeSet.items.length;i++){
        AnimeDataSet.push( new AnimeData(i, importAnimeSet.items[i]) );
      }
    });
  }

  window.onload = (()=>{
    const START_DATE = 12;
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
          this.getAjax();
        },
        getAjax: function(){
          let startDateFormat = date_format(this.startDate);
          let endDateFormat = date_format(this.endDate);
          getAjaxAnimedata(startDateFormat, endDateFormat, this.list);
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
    app.searchAnime();
  })();
})();
