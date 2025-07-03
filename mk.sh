#!/bin/sh
set -e

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
}

main "$@"
