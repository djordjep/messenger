#!/bin/bash

gnome-terminal --command="bash -c 'cd /app/Messenger/docker && docker compose up; $SHELL'";
sleep 5
gnome-terminal --command="bash -c 'docker exec -it docker-mesenger-client-app-1 bash; $SHELL'" --window-with-profile=user2;
gnome-terminal --command="bash -c 'docker exec -it docker-mesenger-backend-api-1 bash; $SHELL'" --window-with-profile=user3;