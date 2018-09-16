<?php
  $query = [
    'tid' => $_POST["tid"],
    'rank' => $_POST["rank"],
    'number' => $_POST["number"],
    'comment' => $_POST["comment"]
  ];
  $options = array(
    'http' => array(
      'method' => 'POST',
      'content' => http_build_query($query)
    )
  );
  try{
    $url = "https://script.google.com/macros/s/AKfycbzR10BcuzEas4eK37Af8oa7QPg4Q5EkiZicMNd06zaKH5m8xElm/exec";
    $contents = file_get_contents($url, false, stream_context_create($options));
    header("Content-type: application/json; charset=utf-8");
    echo $contents;
  } catch (PDOException $e) {
    echo "error";
  }
