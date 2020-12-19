"use strict";
// アニメ情報とアニメ各話情報の結合
const assignAnimeAboutAndStory = (about, story) => {
  let minogashiAnimeList = [];
  for(let i=0; i<story.length; i++){
    for(let j=0; j<about.length; j++){
      if(story[i].tid == about[j].tid){
        minogashiAnimeList.push(
           Object.assign(story[i].dataValues, about[j].dataValues)
        );
        break;
      }
    }
  }
  return minogashiAnimeList;
}

exports.assignAnimeAboutAndStory = assignAnimeAboutAndStory;