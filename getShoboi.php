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
  header("Content-type: application/json; charset=utf-8");
  echo $content;
