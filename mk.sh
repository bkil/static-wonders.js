#!/bin/sh
set -e

get_zip_size0() {
  local ZIP
  ZIP="$1.br"
  if ! [ -f "$ZIP" ]; then
    ZIP="$1.gz"
    if ! [ -f "$ZIP" ]; then
      ZIP="$1"
    fi
  fi
  if [ -f "$ZIP" ]; then
    du -b "$ZIP" |
    cut -f 1
  else
    echo 0
  fi
}

get_zip_size() {
  local SIZE JS DIR
  SIZE="`get_zip_size0 "$@"`"
  DIR="`dirname "$1"`"
  {
    case "$1" in
    *.htm|*.html)
      grep -oiE "<script\b[^>]*\bsrc=[^>]*>" "$1" |
      sed -r "
        s~.* src='([^']+)'.*~\1~
        t e
        s~.* src=\"([^\"]+)\".*~\1~
        t e
        s~.* src=([^ >]+)[ >].*~\1~
        :e
        " |
      while read JS; do
        get_zip_size0 "$DIR/$JS"
      done
      ;;
    esac
    printf -- "%s\n" "$SIZE"
  } |
  awk '{s += $1} END {print s}'
}

get_htm_meta() {
  local MF
  readonly MF="$1"
  case "$MF" in
  *.htm|*.html)
    {
      grep -m1 -i -o '<title>.*</title>' "$MF" || echo
    } | sed "s~<[^>]*>~~g"
    {
      grep -m1 -i -o -E "<meta (name|property)=['\"]?(og:)?description['\" ][^>]*>" "$MF" ||
      grep -m1 -i -o -E "<meta [^>]*\b(name|property)=['\"]?(og:)?description['\" ][^>]*>" "$MF" || echo
    } | sed -r "
      s~.* content='([^']+)'.*~\1~
      t e
      s~.* content=\"([^\"]+)\".*~\1~
      :e
      "
    ;;
  *)
    echo
    echo
    ;;
  esac
}

index_csv() {
  local S F

  git ls-tree -l -r HEAD |
  tr -s " " |
  cut -d " " -f 4- |
  while read S F; do
    printf -- "%s %s %s " "$F" "$S" "`get_zip_size "$F"`"
    git log --follow --date=short --format='%ct %cd' -- "$F" |
    awk '
      {
        e=$0;
        if (s=="") {
          s=e;
        }
      }
      END {
        printf("%s", s);
        if (s!=e) {
          printf(" %s", e);
        }
      }'
    echo

    get_htm_meta "$F"
  done > files.csv
  gzip -9 -f -k files.csv
  brotli -9 -f -k files.csv
}

main() {
  crypto/mk.sh
  jump/mk.sh
  userjs/mk.sh

  {
    cat index.head.html.tpl

    {
      git ls-files | grep -E "\.html?$"
      for DIR in crypto jump userjs; do
        find "$DIR" -mtime -1 -type f -iname '*.html'
      done
    } |
    sort -u |
    sed -r "s~^(.*)$~<li><a href=\"\1\" target=_blank>\1</a></li>~"

    cat index.tail.html.tpl
  } > index.html

  find . -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|json\|dz\|index\|csv\)$\|.*/LICENSE$' -exec gzip -9 -f -k {} \;
  find . -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\|json\|dz\|index\|csv\)$\|.*/LICENSE$' -exec brotli -f -k {} \;

  index_csv
}

main "$@"
