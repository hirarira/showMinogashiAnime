#!/bin/bash
# 環境変数は .env（リポジトリ管理外）から読み込む
set -a
source ./.env
set +a
node index.js
