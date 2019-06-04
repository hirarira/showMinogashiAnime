module.exports = class{
  constructor(sequelize) {
    const Sequelize = require('sequelize');
    this.model = sequelize.define('animeReview', {
      // フィールド名
      tid: {
        // フィールドの型
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      watchDate: Sequelize.TEXT,
      rate: Sequelize.INTEGER,
      airtime: Sequelize.INTEGER,
      comment: Sequelize.TEXT,
      original: Sequelize.TEXT,
      genre: Sequelize.TEXT
    }, {
      // モデル名をそのままテーブル名として使う
      freezeTableName: true,
      timestamps: false
    });
  }
  getAnimeReview(tid){
    return this.model.findAll({
      where: {
        tid: tid
      }
    });
  }
  getAllAnimeReview(){
    return this.model.findAll();
  }
}