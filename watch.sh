#!/bin/sh

pid=

start_project() {
	npm run start &
	pid=$!
}

while true
do
	if [ -n "$pid" ]
	then
		kill "$pid"
		wait "$pid" 2>/dev/null
		pid=
	fi

	start_project

	inotifywait -e modify ./dist/index.js >/dev/null 2>&1
	echo "File index.js changed. Restarting the project..."
done
