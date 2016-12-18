#!/bin/sh

INDEXFILES=$(find ./ -name "index.ts")

for f in $INDEXFILES
do
  echo "Indexing: $(dirname $f)"
  > $f
  FILES=$(ls $(dirname $f) | grep -P '^(?!index)(.*)\.ts')
  for ff in $FILES
  do
    echo "-- File: $ff"
    echo "export * from './${ff%.*}'" >> $f
  done
done
