<?php
declare(strict_types=1);
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use Illuminate\Database\Eloquent\Model;
require './vendor/autoload.php';

$app = new \Slim\App();

$app->get('/',function(){
  return "ok";
});

$app->run();
