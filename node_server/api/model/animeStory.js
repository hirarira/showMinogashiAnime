module.exports = class{
  constructor(sequelize) {
    const Sequelize = require('sequelize');
    this.moment = require('moment');
    this.sequelize = Sequelize;
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
        minogashi: 0,
        StTime: {
          [this.sequelize.Op.lte]: this.moment().unix()
        }
      }
    });
  }
  getWeekMinogashiAnime(start){
    return this.model.findAll({
      where: {
        minogashi: 0,
        StTime: {
          [this.sequelize.Op.between]: [
            start.unix(),
            this.moment().unix()
          ]
        }
      }
    });
  }
  getAnimeStories(storyList){
    return this.model.findAll({
      where: {
        [this.sequelize.Op.or]: storyList
      }
    });
  }
  insertAnimeStories(storyList){
    return this.model.bulkCreate(storyList);
  }
  setAnimeStory(options){
    return this.model.update({
      minogashi: options.minogashi,
      comment: options.comment
    },{
      where: {
        tid: options.tid,
        count: options.count
      }
    });
  }
  updateSubTitle(options){
    return this.model.update({
      subTitle: options.subTitle
    },{
      where: {
        tid: options.tid,
        count: options.count
      }
    });
  }
  /**
   * 指定の期間のアニメの各話を取得する
   * @param date start 
   * @param date end 
   */
  getAnyTimeAnimeStories(start, end) {
    return this.model.findAll({
      where: {
        StTime: {
          [this.sequelize.Op.between]: [
            start.unix(),
            end.unix()
          ]
        }
      }
    })
  }
}
