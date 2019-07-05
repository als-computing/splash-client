#!/bin/bash

read -p "Server: [mwet.lbl.gov]: " server
server=${server:-mwet.lbl.gov}

read -p "remote_user: []: " remote_user
remote_user=${remote_user:-{}



read -p "remote folder: [/docker/letsencrypt-docker-nginx/src/production/production-site: " folder
folder=${folder:-/docker/letsencrypt-docker-nginx/src/production/production-site}


echo building

npm run build

echo Deploying to $server with user $remote_user
pwd
cd dist/static
scp -rp * $remote_user@$server:$folder 

cd ../..