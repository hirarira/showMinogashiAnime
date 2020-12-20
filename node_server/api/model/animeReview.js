module.exports = class{
  constructor(seq) {
    this.Sequelize = require('sequelize');
    this.model = seq.define('animeReview', {
      // フィールド名
      tid: {
        // フィールドの型
        type: this.Sequelize.INTEGER,
        primaryKey: true
      },
      watchDate: this.Sequelize.TEXT,
      rate: this.Sequelize.INTEGER,
      airtime: this.Sequelize.INTEGER,
      comment: this.Sequelize.TEXT,
      original: this.Sequelize.TEXT,
      genre: this.Sequelize.TEXT
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
  getWatchDateAnimes(watchDate) {
    return this.model.findAll({
      where: {
        watchDate: {
          [this.Sequelize.Op.like]: `%${watchDate}%`
        }
      }
    });
  }
  getRateAnimeReview(lowLimit, highLimit) {
    return this.model.findAll({
      where: {
        rate: {
          [this.Sequelize.Op.between]: [lowLimit, highLimit]
        }
      }
    });
  }
  getAnimeReviews(tidList){
    return this.model.findAll({
      where: {
        tid: {
          [this.Sequelize.Op.in]: tidList
        }
      }
    });
  }
  getAllAnimeReview(){
    return this.model.findAll();
  }
  initReview(tid){
    return this.model.create({
      tid: tid
    });
  }
  updateReview(options){
    return this.model.update({
      rate: options.rate,
      comment: options.comment,
      watchDate: options.watchDate
    },{
      where: {
        tid: options.tid
      }
    });
  }
}
