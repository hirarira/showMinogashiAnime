(()=>{
  "use strict"
  let app = new Vue({
    el: '#app',
    data: {
      username: ''
    },
    methods:{
      getUserName: function(e){
        $.get("./username/", (res)=>{
          this.username = res.username;
        });
      }
    }
  });
  app.getUserName();
})();
