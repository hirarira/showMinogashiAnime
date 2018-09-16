<?php
  $query = [
    'tid' => $_GET["tid"]
  ];
  try{
    $url = "https://script.google.com/macros/s/AKfycbzR10BcuzEas4eK37Af8oa7QPg4Q5EkiZicMNd06zaKH5m8xElm/exec";
    $content = file_get_contents($url . "?" . http_build_query($query));
    header("Content-type: application/json; charset=utf-8");
    echo $content;
  } catch (PDOException $e) {
    echo "error";
  }
