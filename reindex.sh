#!/bin/sh

startDir=$(pwd)
for f in $(find ./ -name "index.ts")
do
  echo "Indexing: $(dirname $f)"
  > $f
  cd $startDir
  cd $(dirname $f)
  for ff in $(find . | grep -P '^.*(?<!index)\.ts$')
  do
    cd $startDir
    echo "-- Added: $ff"
    echo "export * from '${ff%.*}'" >> $f
  done
done
