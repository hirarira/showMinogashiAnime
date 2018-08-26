<?php
  $query = [
    'Flag' => $_GET["flag"],
    'Checked' => 1,
    'FSTKN' => 'hhqx1osbxxtqmsi4l1n6yn8g',
    'type' => 'UpdateUps',
    'TID' => $_GET["tid"],
    'Count' => $_GET["count"]
  ];
  $host = "http://cal.syoboi.jp/uc";
  $content = file_get_contents($host . "?" . http_build_query($query));
  header("Content-type: application/json; charset=utf-8");
  echo $content;
