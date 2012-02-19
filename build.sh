#!/bin/bash
kill_prev_server(){
    if [ -f .pid ]; then
        cat .pid | xargs kill 2> /dev/null
    fi
}

start_server(){
    (node server.js &> out.log) &
    echo $! > .pid
}

run_tests(){
    vows --spec test.js
}

kill_prev_server
start_server
#run_tests


