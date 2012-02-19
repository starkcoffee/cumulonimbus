#!/bin/bash
kill_prev_server(){
    if [ -f .pid ]; then
        cat .pid | xargs kill 2> /dev/null
    fi
}

start_server(){
    (node server.js &> out.log) &
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
    vows --spec test.js
}

kill_prev_server
start_server
#run_tests


