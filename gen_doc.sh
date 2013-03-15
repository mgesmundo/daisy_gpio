#!/bin/sh

# Generate jsduck documentation
# See [https://github.com/senchalabs/jsduck]

jsduck  lib/daisy.js \
        --output="doc" \
        --title="Daisy GPIO documentation" \
		--footer="Copyright (c) 2012-2013 Yoovant by Marcello Gesmundo" \
        --warnings=-link,-dup_member,-no_doc
