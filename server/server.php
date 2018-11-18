<?php
declare(strict_types=1);
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Eloquent\Model;
require './vendor/autoload.php';

$app = new \Slim\App();

$app->get('/',function(){
  return "";
});

$app->get('/getShoboi',function(Request $request, Response $response){
  require_once './password.php';
  $query = [
    'filter' => $request->getQueryParam("filter"),
    'alt' => $request->getQueryParam("alt"),
    'usr' => $request->getQueryParam("usr"),
    'start' => $request->getQueryParam("start"),
    'end' => $request->getQueryParam("end")
  ];
  $host = "http://cal.syoboi.jp/rss2.php";
  $content = file_get_contents($host . "?" . http_build_query($query));
  $animeList = json_decode($content);
  $response = $response->withHeader('Content-type', 'application/json');
  // DB接続
  try {
    $pdo = new PDO('mysql:dbname=anime;host=localhost;charset=utf8mb4', $connect['user'], $connect['pass']);
    // DBに保存
    $get_query = 'select * from anime where tid = ?';
    $set_query = 'insert into anime ( `tid`, `title`, `chname`, `url` ) VALUES (?, ?, ?, ?)';
    $get_story_query = 'select * from animeStory where (tid = ? AND count = ?)';
    $set_story_query = 'insert into animeStory ( `tid`, `Count`, `StTime`, `EdTime`, `LastUpdate`, `SubTitle` ) VALUES (?, ?, ?, ?, ?, ?)';
    $update_story_query = 'update animeStory set `StTime` = ?, `EdTime` = ?,`LastUpdate` = ?, `SubTitle` = ? where `id` = ?';
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
          // サブタイがNULLのときは空白を登録
          if(is_null($animeList->items[$i]->SubTitle)){
            $setStory->bindValue(6, '');
          }
          else{
            $setStory->bindValue(6, $animeList->items[$i]->SubTitle);
          }
          $setStory->execute();
        }
        else{
          $res = $getStory->fetchAll()[0];
          $animeList->items[$i]->minogashi = ($res['minogashi'] == 1);
          $animeList->items[$i]->comment = $res['comment'];
          // 更新を行う
          if($res["SubTitle"] != $animeList->items[$i]->SubTitle){
            $updateStory = $pdo->prepare($update_story_query);
            $updateStory->bindValue(1, $animeList->items[$i]->StTime);
            $updateStory->bindValue(2, $animeList->items[$i]->EdTime);
            $updateStory->bindValue(3, $animeList->items[$i]->LastUpdate);
            $updateStory->bindValue(4, $animeList->items[$i]->SubTitle);
            $updateStory->bindValue(5, $res['id']);
            $updateStory->execute();
          }
        }
      }
    }
    $response->getBody()->write( json_encode($animeList) );
  } catch (PDOException $e) {
    $response->getBody()->write( $content );
  }
  return $response;
});

$app->run();
