#!/bin/sh

for f in $(find app -name '*.js' | grep -P '^.*(?<!systemjs\.config)\.js$')
do
    echo Minifying $f
    ./node_modules/.bin/uglifyjs --compress --mangle --screw-ie8 $f -o $f
done
