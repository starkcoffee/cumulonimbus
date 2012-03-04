#!/bin/bash
kill_server(){
    if [ -f .pid ]; then
        cat .pid | xargs kill 2> /dev/null
    fi
}

start_server(){
    (node lib/server.js &> out.log) &
    # save pid so we can kill it
    echo $! > .pid
    # check for errors on startup
    sleep 2
    grep -i error out.log
    if [ $? -eq 0 ]; then
        cat out.log
        exit 1
    fi
}

run_tests(){
    npm test --spec spec/test.js
}

mkdir -p tmp uploads
kill_server
start_server
run_tests
head -5 out.log
kill_server


