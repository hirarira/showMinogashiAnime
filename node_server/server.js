"use strict";
const Express = require("express");
const BodyParser = require('body-parser');
const Sequelize = require('sequelize');
const AnimeReview = require('./model/animeReview.js');
const DBSetting = require('./model/dbSetting.js');
const app = Express();
const sequelize = DBSetting();

let animeReview = new AnimeReview(sequelize);
if(animeReview == null){
  return;
}

// urlencodedとjsonは別々に初期化する
app.use(BodyParser.urlencoded({
    extended: true
}));
app.use(BodyParser.json());

let server = app.listen(3333, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

app.get("/test", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let res_body = { status: 'ok' };
  res.send(res_body);
});

// レビューを1件返す
app.get("/getAnimeReview/:tid", (req, res)=>{
  animeReview.getAnimeReview(req.params.tid)
  .then((db_data)=>{
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: db_data
    };
    res.send(res_body);
  })
});

app.get("/getAllAnimeReview", (req, res)=>{
  animeReview.getAllAnimeReview()
  .then((db_data)=>{
    res.header('Content-Type', 'application/json');
    let res_body = {
      status: 'ok',
      body: db_data
    };
    res.send(res_body);
  })
});

// 404
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  let res_body = {
    status: 'ng',
    body: '404 not found'
  };
  res.status(404).send(res_body);
});
