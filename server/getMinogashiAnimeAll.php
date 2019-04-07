<?php
try{
  require_once './password.php';
  
  $get_minogashi_query =
    'SELECT * FROM `animeStory` AS T1 JOIN `anime`
    AS T2 ON T1.tid = T2.tid
    WHERE T1.`minogashi` = 0 AND
    T1.`StTime` < ?
    ORDER BY T1.`StTime` DESC';
  $get_minogashi = $pdo->prepare($get_minogashi_query);
  $get_minogashi->bindValue(1, time());
  $get_minogashi->execute();
  $res = $get_minogashi->fetchAll();
  header("Content-type: application/json; charset=utf-8");
  echo json_encode($res);
} catch (PDOException $e) {
  echo "error";
}
