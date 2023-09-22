#!/bin/bash

## Container Name as specified in docker-compose.yml
$DOCKER_CONTAINER_NAME="hasura-api-server"

## create docker image
docker-compose build

## Start/Restart docker container
docker-compose rm -svf $DOCKER_CONTAINER_NAME;
docker-compose up -d $DOCKER_CONTAINER_NAME --force-recreate


## Reload container
docker-compose up
