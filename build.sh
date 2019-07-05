#!/bin/bash 

cd ../ui

npm run build  && rm -rf ../web/dist > /dev/null && cp -r ../ui/dist ../web/dist
cd ../web
docker build -t $1 .
