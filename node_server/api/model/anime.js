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
      hashTag: Sequelize.TEXT,
      characterURL: Sequelize.TEXT,
      publicURL: Sequelize.TEXT,
      thumbnail: Sequelize.STRING
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
  searchAnimeByTitle(query, limit){
    const Sequelize = require('sequelize');
    return this.model.findAll({
      where: {
        title: {
          [Sequelize.Op.like]: `%${query}%`
        }
      },
      order: [['tid', 'DESC']],
      limit: limit
    });
  }
  insertAnimeAbout(options){
    return this.model.create({
      tid: options.tid,
      title: options.title,
      chName: options.chName,
      url: options.url
    });
  }
  updateAnimeAbout(options){
    return this.model.update({
      hashTag: options.hashTag,
      characterURL: options.characterURL,
      publicURL: options.publicURL
    },{
      where: {
        tid: options.tid
      }
    });
  }
  updateThumbnail(fileName, tid){
    return this.model.update({
      thumbnail: fileName
    },{
      where: {
        tid: tid
      }
    });
  }
}
