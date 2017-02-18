#!/bin/sh

for f in $(find ./ -name "index.ts")
do
  echo "Indexing: $(dirname $f)"
  > $f
  for ff in $(ls $(dirname $f) | grep -P '^(?!index)(.*)\.ts$')
  do
    echo "-- Added: $ff"
    echo "export * from './${ff%.*}'" >> $f
  done
done
