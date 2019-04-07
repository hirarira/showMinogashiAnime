<?php
  $connect = array(
    'user' => '****',
    'pass' => '****'
  );
  $pdo = new PDO('mysql:dbname=anime;host=localhost;charset=utf8mb4', $connect['user'], $connect['pass']);
?>
