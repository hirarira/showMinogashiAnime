(()=>{
  "use strict"
  // アニメデータを蓄積するためのclass
  class AnimeData{
    constructor(id, in_set){
      this.id = id;
      this.youbi = ["日","月","火","水","木","金","土"];
      this.startTime = new Date(in_set.StTime*1000);
      this.endTime = new Date(in_set.EdTime*1000);
      this.title = in_set.Title;
      this.count = in_set.Count;
      this.channel = in_set.ChName;
      this.channelID = in_set.ChID;
      this.subTitle = in_set.SubTitle;
      this.hashTag = in_set.hashTag;
      this.minogashi = in_set.minogashi;
      this.comment = in_set.comment;
      this.url = in_set.Urls;
      this.characterURL = in_set.characterURL;
      this.topUrl = this.url.split("\t")[0];
      this.minogashi_sb = (in_set.UPSFlag==1);
      this.tid = in_set.TID;
      this.subtitleListUrl = "http://cal.syoboi.jp/tid/"+this.tid+"/subtitle";
    }
    showInfo(){
      let outstr = "タイトル："+this.title+"\n";
      if(this.count !== null){
          outstr += "#"+this.count+"：";
      }
      if(this.subTitle !== null){
        outstr += this.subTitle+"\n";
      }
      outstr += "放送日："  +(this.startTime.getMonth()+1) + "月" + this.startTime.getDate() + "日(" + YOUBI[ this.startTime.getDay() ] + ")\n";
      outstr += "放送時刻："+this.startTime.getHours()+":"+this.startTime.getMinutes()+"\n";
      if(this.channel !== null){
          outstr += "放送局:"+this.channel+"\n";
      }
      outstr += "公式サイト："+this.url+"\n";
      outstr += "チェック用URL：" + this.subtitleListUrl + "\n";
      // console.log(outstr);
      return outstr;
    }

    seikeiTime(num){
      return num<10? '0'+num: num+'';
    }

    getMinogashi(){
      return this.minogashi;
    }
  }
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
