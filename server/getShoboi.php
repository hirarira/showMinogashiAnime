<?php
  $query = [
    'filter' => $_GET["filter"],
    'alt' => $_GET["alt"],
    'usr' => $_GET["usr"],
    'start' => $_GET["start"],
    'end' => $_GET["end"]
  ];
  $host = "http://cal.syoboi.jp/rss2.php";
  $content = file_get_contents($host . "?" . http_build_query($query));
  $animeList = json_decode($content);
  // DB接続
  try {
    require_once './password.php';
    $pdo = new PDO('mysql:dbname=anime;host=localhost;charset=utf8mb4', $connect['user'], $connect['pass']);
    // DBに保存
    $get_query = 'select * from anime where tid = ?';
    $set_query = 'insert into anime ( `tid`, `title`, `chname`, `url` ) VALUES (?, ?, ?, ?)';
    $get_story_query = 'select * from animeStory where (tid = ? AND count = ?)';
    $set_story_query = 'insert into animeStory ( `tid`, `Count`, `StTime`, `EdTime`, `LastUpdate`, `SubTitle` ) VALUES (?, ?, ?, ?, ?, ?)';
    for($i=0; $i< count($animeList->items); $i++){
      $get = $pdo->prepare($get_query);
      $get->bindValue(1, $animeList->items[$i]->TID);
      $get->execute();
      $existAnime =  $get->rowCount() > 0;
      // DBにないなら新規登録する
      if(!$existAnime){
        $set = $pdo->prepare($set_query);
        $set->bindValue(1, $animeList->items[$i]->TID);
        $set->bindValue(2, $animeList->items[$i]->Title);
        $set->bindValue(3, $animeList->items[$i]->ChName);
        $set->bindValue(4, $animeList->items[$i]->Urls);
        $set->execute();
      }
      else{
        $res = $get->fetchAll()[0];
        $animeList->items[$i]->hashTag = $res['hashTag'];
        $animeList->items[$i]->characterURL = $res['characterURL'];
      }
      // 話数があるかチェック
      if($existAnime){
        $getStory = $pdo->prepare($get_story_query);
        $getStory->bindValue(1, $animeList->items[$i]->TID);
        $getStory->bindValue(2, $animeList->items[$i]->Count);
        $getStory->execute();
        // ない場合登録する
        if($getStory->rowCount() == 0){
          $setStory = $pdo->prepare($set_story_query);
          $setStory->bindValue(1, $animeList->items[$i]->TID);
          $setStory->bindValue(2, $animeList->items[$i]->Count);
          $setStory->bindValue(3, $animeList->items[$i]->StTime);
          $setStory->bindValue(4, $animeList->items[$i]->EdTime);
          $setStory->bindValue(5, $animeList->items[$i]->LastUpdate);
          $setStory->bindValue(6, $animeList->items[$i]->SubTitle);
          $setStory->execute();
        }
        else{
          $res = $getStory->fetchAll()[0];
          $animeList->items[$i]->minogashi = ($res['minogashi'] == 1);
          $animeList->items[$i]->comment = $res['comment'];
        }
      }
    }
    header("Content-type: application/json; charset=utf-8");
    echo json_encode($animeList);
  } catch (PDOException $e) {
    header("Content-type: application/json; charset=utf-8");
    echo $content;
  }
