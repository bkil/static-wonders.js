#!/bin/sh
# minification: https://github.com/bkil/private-plugin.php/tree/master/src/include

O="$(readlink -f "$(dirname "$0")")"

for B in sha1; do
  {
    sed "s~^<body>~  <link rel='shortcut icon' type=image/x-icon href=data:image/x-icon;,>\n&~" $O/$B.html

    echo '<script>'
    cat $O/$B.js
    echo '</script>'
  } > $O/$B-inlined.html
done
