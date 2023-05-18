#!/bin/sh

main() {
  local O FILE TIME NAME BASE BLET BODY
  readonly O="`dirname "$(readlink -f "$0")"`"
  {
    cat_common_head 'all user.js'
    printf 'Please open the following individual pages to access the respective bookmarklet.\n<ul>\n'

    for FILE in "$O"/*.user.js; do
      TIME="`git log -n 1 --pretty=format:%ad --date=short "$FILE"`"
      [ -n "$TIME" ] || continue
      NAME="`basename "$FILE"`"
      BASE="`basename "$NAME" .user.js`"
      BLET="$O/$BASE.html"

      printf '<li><a href="%s">%s</a></li>\n' "$BASE.html" "$BASE"

      {
        cat_bookmarklet_head "$NAME"

        BODY="`escape_file "$FILE"`"

cat << EOF
<ul>
<li>
 <a class=bookmarklet onclick="location.hash=href;return false" href="javascript:${BODY}">${BASE} ${TIME}</a>
 <span class=source>(readable <a href="${NAME}">source</a>)</span>
</li>
</ul>
<textarea style="width:100%;height:50%"></textarea>
<p>
<a class=overview href="gen-bookmarklet.html">Overview of other bookmarklets</a>
<script>
document.getElementsByTagName('textarea')[0].value = document.links[0].href;
</script>
EOF

        cat_tail
      } > "$BLET"
    done

    echo "</ul>"
    cat_tail
  } > "$O"/gen-bookmarklet.html
}

escape_file() {
  local ESCAPED
  cat "$@" |
  awk '
    BEGIN {
      RS="(.)";
      for(i=0; i < 256; i++) {
        ord[sprintf("%c", i)] = i;
      }
      ok = "!()+,-./0123456789:;=?@ABCDEFGHIJKLMNOPQRSTUVWXYZ^_abcdefghijklmnopqrstuvwxyz{|}~";
    }
    {
      if (index(ok, RT) > 0) {
        printf("%c", RT);
      } else {
        printf("%%%02x", ord[RT]);
      }
    }
  ' |
  sed -r "s~\)$~%29~"
}

cat_bookmarklet_head() {
  cat_common_head "$@"

  cat << EOF
<style>

.bookmarklet {
  text-decoration: none;
  cursor: grabbing;
  outline: auto;
}

.source {
  font-size: smaller;
  opacity: 0.5;
}

.overview {
  font-size: xx-small;
  opacity: 0.5;
}

html, body {
  height: 100%;
}
</style>
You can drag &amp; drop the following bookmarklet to your bookmark bar instead of using a UserScript manager.
<p>
You will then need to click it twice: first to open the vendor page (not supported by all bookmarklets), and a second time to activate the customized rich interface if you are on the vendor page.
<p>
EOF
}

cat_common_head() {
  local HEADBASE
  readonly HEADBASE="$1"
cat << EOF
<!DOCTYPE html>
<html lang=en>
<head>
  <meta charset=utf-8>
  <title>Bookmarklet version of $HEADBASE UserScript</title>
  <link rel='shortcut icon' type=image/x-icon href=data:image/x-icon;,>
  <meta name=viewport content='width=device-width, initial-scale=1.0'>
</head>
<body>
EOF
}

cat_tail() {
cat << EOF
</body>
</html>
EOF
}

main "$@"
