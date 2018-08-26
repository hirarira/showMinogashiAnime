<?php
  $tid = $_POST["tid"];
  $count = $_POST["count"];
  $minogashi = $_POST["minogashi"];
  $comment = $_POST["comment"];
  try{
    $setMinogashi = $minogashi == 'true'? 1: 0;
    require_once './password.php';
    $pdo = new PDO('mysql:dbname=anime;host=localhost;charset=utf8mb4', $connect['user'], $connect['pass']);
    $update_query = 'update animeStory SET minogashi = ?, comment = ? WHERE tid = ? AND count = ?';
    $update = $pdo->prepare($update_query);
    $update->bindValue(1, $setMinogashi);
    $update->bindValue(2, $comment);
    $update->bindValue(3, $tid);
    $update->bindValue(4, $count);
    $update->execute();
  } catch (PDOException $e) {
    echo "error";
  }
