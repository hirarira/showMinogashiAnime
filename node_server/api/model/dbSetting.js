module.exports = function(){
  "use strict";
  const Sequelize = require('sequelize');
  const db = {
    name: 'anime',
    user: process.env.ANIME_DB_USER_NAME,
    pass: process.env.ANIME_DB_PASS,
    host: process.env.ANIME_DB_HOST,
    dialect: 'mysql'
  };

  if(db.user == null || db.pass == null){
    console.log("ENV:DB_UASENAME or DB_PASS is null");
    return null;
  }

  return new Sequelize(db.name, db.user, db.pass, {
    host: db.host,
    dialect: db.dialect
  });
}
