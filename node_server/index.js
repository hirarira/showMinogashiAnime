"use strict";

require('dotenv').config();

const Express = require("express");
const BodyParser = require('body-parser');
const app = Express();

const username = process.env.ANIME_SHOBOI_CALENDAR_USERNAME;

// urlencodedとjsonは別々に初期化する
app.use(BodyParser.urlencoded({
    extended: true
}));
app.use(BodyParser.json());

let server = app.listen(3333, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

// 静的ファイルを公開
app.use("/", Express.static(__dirname  + '/client/html'));
app.use("/bootstrap", Express.static(__dirname  + '/client/bootstrap'));
app.use("/css", Express.static(__dirname  + '/client/css'));
app.use("/js", Express.static(__dirname  + '/client/js'));
app.use("/img", Express.static(__dirname  + '/client/img'));

let api = require('./api/api.js');
app.use('/api', api);

app.get("/test", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let res_body = { status: 'ok' };
  res.send(res_body);
});

app.get("/username", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let status = 'ok';
  if(!username){
    status = 'ng'
  }
  let res_body = {
    status: status,
    username: username
  };
  res.send(res_body);
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
