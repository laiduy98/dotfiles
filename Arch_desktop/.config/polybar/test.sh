if type "xrandr"; then
  for m in $(xrandr --query | grep " connected" | cut -d" " -f1); do
    if [ "$m" = "eDP-1" ]; then
    polybar -c ~/.config/polybar/config.ini main &
    else
    MONITOR=$m polybar -c ~/.config/polybar/config.ini main &
    fi
  done
else
  polybar -c ~/.config/polybar/config.ini main &
fi


if [ "$m" = "eDP-1" ]; then
  echo "x has the value 'valid'"
  else 
  echo "False"
fi

if [ "$m" = "eDP-1" ]; then
    echo "1"
    else
    echo "2"
    fi