#!/bin/sh

O="`dirname "$(readlink -f "$0")"`"
{
cat << EOF
<!DOCTYPE html>
<html lang=en>
<head>
  <meta charset=utf-8>
  <title>Bookmarklet versions of the shorter user.js</title>
  <link rel="shortcut icon" type=image/x-icon href=data:image/x-icon;,>
  <meta name=viewport content='width=device-width, initial-scale=1.0'>
<style>

.bookmarklet {
  text-decoration: none;
}

.source {
  font-size: smaller;
  opacity: 0.5;
}

</style>
</head>
<body>
You can drag &amp; drop the following bookmarklets to your bookmark bar instead of using a userscript manager:

  <ul>
EOF

for FILE in "$O"/*.user.js; do
  TIME="`git log -n 1 --pretty=format:%ad --date=short "$FILE"`"
  [ -n "$TIME" ] || continue

  BASE="`basename "$FILE"`"

  hexdump -v -e '/1 "_%02X"' "$FILE" |
  sed 's~_~%~g' |
  {
    read BODY
    printf '<li><a class=bookmarklet href="javascript:%s">%s %s</a>\n <span class=source>(readable <a href="%s">source</a>)</span></li>\n' "$BODY" "$BASE" "$TIME" "$BASE"
  }
done

cat << EOF
</ul>
</body>
</html>
EOF

} > "$O"/gen-bookmarklet.html
