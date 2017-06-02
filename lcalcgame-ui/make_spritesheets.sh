#!/bin/sh

set -e

cd resources/graphics/

if [[ -f assets.png ]]; then
    rm assets.png
fi

$(npm root)/.bin/spritesheet-js --padding 2 -f json -n assets *.png aliens/*.png

cd starboy

if [[ -f menu-assets.png ]]; then
    rm menu-assets.png
fi

$(npm root)/.bin/spritesheet-js --padding 2 -f json -n menu-assets *.png stars/*.png
