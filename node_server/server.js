"use strict";
const Express = require("express");
const BodyParser = require('body-parser');
const app = Express();

// urlencodedとjsonは別々に初期化する
app.use(BodyParser.urlencoded({
    extended: true
}));
app.use(BodyParser.json());

let server = app.listen(3333, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

let api = require('./api/api.js');
app.use('/api', api);

app.get("/test", (req, res)=>{
  res.header('Content-Type', 'application/json');
  let res_body = { status: 'ok' };
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
