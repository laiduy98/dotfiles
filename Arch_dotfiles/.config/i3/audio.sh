#!/bin/bash

INDEXINUSE=$(pacmd list-sinks | grep "index:" | grep '*' | awk '{print $3}')


if [[ ! "${1}" =~ ^[-+] ]]; then
    pactl set-sink-mute $INDEXINUSE toggle
else
    if [ $INDEXINUSE -ne 0 ]; then
        current=$(pacmd dump-volumes | awk 'NR==2{print $8}' | sed 's/\%//')
    else
        current=$(pacmd dump-volumes | awk 'NR==1{print $8}' | sed 's/\%//')
    fi
    if [ $current -le 100 ]; then
        pactl set-sink-volume $INDEXINUSE $1
    else
        pactl set-sink-volume $INDEXINUSE 100%
    fi
fi