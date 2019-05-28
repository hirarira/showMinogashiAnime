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
      title: {
        type: Sequelize.TEXT
      },
      chName: {
        type: Sequelize.STRING(50)
      },
      url: {
        type: Sequelize.TEXT
      },
      hashTag: {
        type: Sequelize.STRING(30)
      },
      characterURL: {
        type: Sequelize.TEXT
      },
      publicURL: {
        type: Sequelize.TEXT
      }
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
  getAllAnime(){
    return this.model.findAll();
  }
}
