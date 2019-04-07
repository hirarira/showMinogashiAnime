<?php
  $tid = $_POST["tid"];
  $count = $_POST["count"];
  try{
    require_once './password.php';
    
    $get_anime_query =
      'select * from
      animeStory AS T1
      JOIN anime AS T2
      ON T1.tid = T2.tid
      WHERE T1.tid = ? AND T1.count = ?';
    $get_anime = $pdo->prepare($get_anime_query);
    $get_anime->bindValue(1, $tid);
    $get_anime->bindValue(2, $count);
    $get_anime->execute();
    $res = $get_anime->fetchAll();
    echo json_encode($res);
  } catch (PDOException $e) {
    echo "error";
  }
