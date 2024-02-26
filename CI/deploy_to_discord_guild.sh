#!/bin/bash

# PURPOSE: used be jenkins to launch Wall_e to the CSSS PROD Discord Guild

set -e -o xtrace
# https://stackoverflow.com/a/5750463/7734535

export docker_compose_file="CI/docker-compose.yml"

if [[ "${COMPOSE_PROJECT_NAME}" == "eve_test" ]]; then
    container_name="eve_test"
    image_name="eve_test"
else
    container_name="eve_prod"
    image_name="eve_prod"
fi

docker rm -f "${container_name}" || true
docker image rm -f "${image_name}" || true

BOT_TOKEN="${TOKEN}" GUILD_ID="${GUILD_ID}" CLIENT_ID="${CLIENT_ID}" docker-compose -f "${docker_compose_file}" up -d
sleep 20

container_failed=$(docker ps -a -f name="${container_name}" --format "{{.Status}}" | head -1)

if [[ "${container_failed}" != *"Up"* ]]; then
    docker logs "${container_name}"
    exit 1
fi
