#!/usr/bin/env bash

xrandr=$(xrandr)

con_monitors=$(echo $xrandr | grep -c " connected ")

    if [[ $con_monitors -gt 1 ]]; then
        # All the layouts are saved in "screenlayout" folder.
        # eg cmd. xrandr --output HDMI-1 --mode 2560x1440 --pos 0x0 --rotate normal --output DP-1 --off --output eDP-1 --primary --mode 1920x1080 --pos 283x1440 --rotate normal --output DP-2 --off
	# xrandr --output eDP-1 --off --output DP-1 --primary --mode 1920x1080 --pos 0x0 --rotate normal --output HDMI-1 --off
        for layout in ~/.screenlayout/*.sh; do
            ./layout
        done
    fi
