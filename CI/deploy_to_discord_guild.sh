#!/bin/bash

# PURPOSE: used be jenkins to launch Wall_e to the CSSS PROD Discord Guild

set -e -o xtrace
# https://stackoverflow.com/a/5750463/7734535

rm ${DISCORD_NOTIFICATION_MESSAGE_FILE} || true

export docker_compose_file="CI/docker-compose.yml"

docker rm -f eve || true
docker image rm -f eve || true
BOT_TOKEN="${TOKEN}" GUILD_ID="${GUILD_ID}" docker-compose -f "${docker_compose_file}" up -d
sleep 20

container_failed=$(docker ps -a -f name=eve --format "{{.Status}}" | head -1)

if [[ "${container_failed}" != *"Up"* ]]; then
    docker logs eve
    docker logs eve --tail 12 &> ${DISCORD_NOTIFICATION_MESSAGE_FILE}
    exit 1
fi