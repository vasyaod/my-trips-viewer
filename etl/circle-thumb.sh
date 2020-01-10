#!/bin/bash

#convert 20181213_181138.JPG -alpha on -background none +clone -channel A -evaluate multiply 0 +channel -fill white -draw "ellipse 153,128 57,57 0,360" -compose DstOut -composite circle_out.png

#convert 20181213_181138.JPG -alpha on -background none \
#   +clone -channel A -evaluate multiply 0 +channel -fill white -draw "ellipse 153,128 57,57 0,360" \
#   -composite circle.png

#convert 20181213_181138.JPG -fill white -draw 'circle 36,40,65,45'  image.png

#convert 20181213_181138.JPG -alpha on \( +clone -threshold -1 -negate -fill white -draw "circle 539,539 539,0" \) -compose copy_opacity -composite output_circ.png

SIZE=32
HALF_SIZE=16

convert -size ${SIZE}x${SIZE} xc:none -fill $1"[${SIZE}x${SIZE}^]" -draw "circle ${HALF_SIZE},${HALF_SIZE} ${HALF_SIZE},1" $2