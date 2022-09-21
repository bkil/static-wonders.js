#!/bin/sh
# minification: https://github.com/bkil/private-plugin.php/tree/master/src/include

O="$(readlink -f "$(dirname "$0")")"

for B in sha1; do
  {
    cat $O/$B.html
    echo '<script>'
    cat $O/$B.js
    echo '</script>'
  } > $O/$B-inlined.html
done
