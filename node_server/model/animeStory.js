module.exports = class{
  constructor(sequelize) {
    const Sequelize = require('sequelize');
    this.model = sequelize.define('animeStory', {
      // フィールド名
      id: {
        // フィールドの型
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      tid: Sequelize.INTEGER,
      count: Sequelize.INTEGER,
      stTime: Sequelize.INTEGER,
      edTime: Sequelize.INTEGER,
      lastUpdate: Sequelize.INTEGER,
      subTitle: Sequelize.TEXT,
      minogashi: Sequelize.TINYINT,
      comment: Sequelize.TEXT
    }, {
      // モデル名をそのままテーブル名として使う
      freezeTableName: true,
      timestamps: false
    });
  }
  getAllAnimeStory(tid){
    return this.model.findAll({
      where: {
        tid: tid
      },
      // 話数順にソート
      order: [
        ['count', 'ASC']
      ]
    });
  }
  getAllMinogashiStory(){
    return this.model.findAll({
      where: {
        minogashi: 0
      }
    });
  }
  getWeekMinogashiAnime(){

  }
}
