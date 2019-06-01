module.exports = class{
  constructor(sequelize) {
    const Sequelize = require('sequelize');
    this.model = sequelize.define('anime', {
      // フィールド名
      tid: {
        // フィールドの型
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      title: Sequelize.TEXT,
      chName: Sequelize.STRING,
      url: Sequelize.TEXT,
      hashTag: Sequelize.STRING,
      characterURL: Sequelize.TEXT,
      publicURL: Sequelize.TEXT
    }, {
      // モデル名をそのままテーブル名として使う
      freezeTableName: true,
      timestamps: false
    });
  }
  getAnime(tid){
    return this.model.findAll({
      where: {
        tid: tid
      }
    });
  }
  getAnimeList(tidList){
    return this.model.findAll({
      where: {
        tid: tidList
      }
    });
  }
  getAllAnime(){
    return this.model.findAll();
  }
}
