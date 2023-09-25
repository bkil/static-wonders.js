#!/bin/sh
set -e

crypto/mk.sh
jump/mk.sh
userjs/mk.sh

{
  cat index.head.html.tpl

  {
    git ls-files | grep "\.html$"
    for DIR in crypto jump userjs; do
      find "$DIR" -mtime -1 -type f -iname '*.html'
    done
  } |
  sort -u |
  sed -r "s~^(.*)$~<li><a href=\"\1\" target=_blank>\1</a></li>~"

  cat index.tail.html.tpl
} > index.html
