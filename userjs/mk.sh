#!/bin/sh
. "`dirname "$0"`/html.inc.sh" # escape_file

main() {
  local O FILE TIME NAME BASE BLET BODY
  readonly O="`dirname "$(readlink -f "$0")"`"
  {
    cat_common_head 'all user.js'
    printf 'Please open the following individual pages to access the respective <a href="https://en.wikipedia.org/wiki/Bookmarklet" target=_blank>bookmarklet</a>.\n<ul>\n'

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
 <span class=source>(readable <a href="${NAME}">source</a> .user.js)</span>
</li>
</ul>
<p>
You will then need to click it twice: first to open the vendor page (not supported by all bookmarklets), and a second time to activate the customized rich interface if you are on the vendor page.
</p><p>
You should periodically check this page for updates, as these bookmarklets contain a complete frozen offline source code snapshot for compatibility and security.
</p>
<hr>
<p>
As a convenience to access it in restricted (mobile) browsers, you can also paste the link to the end of your address bar by clicking the link. Its content is also displayed in the box below if copy &amp; pasting is your only option:
</p>
<textarea></textarea>
<p>
<button type=button onclick="document.getElementsByTagName('textarea')[0].value=unescape(document.links[2].href)">View unescaped</button>
<a class=overview href="gen-bookmarklet.html">Overview of other bookmarklets</a>
</p>
<script>
document.links[2].href = document.links[2].href
  .replace(
    /(\()(\);(?:(?:%09|%0a|%0d|%20)*(?:\/\/(?:[^%]|%[^0].|%0[^a])*)?)*)\$/,
    '\$1{"updateUrl":"' + window.location.href + '"}\$2');
document.getElementsByTagName('textarea')[0].value = document.links[2].href;
</script>
EOF

        cat_tail
      } > "$BLET"
    done

    echo "</ul>"
    cat_tail
  } > "$O"/gen-bookmarklet.html
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

.overview, button {
  font-size: xx-small;
  opacity: 0.5;
}

textarea {
 min-width: 100%;
 max-width: 100%;
 min-height: 50%;
}

html, body {
  height: 100%;
}
</style>
<p>
You can drag &amp; drop the following <em>bookmarklet</em> <sup><a href="https://en.wikipedia.org/wiki/Bookmarklet" target=_blank>[definition]</a></sup> to your bookmark bar instead of using a <em>UserScript manager</em> <sup><a href="https://en.wikipedia.org/wiki/Userscript_manager" target=_blank>[definition]</a></sup>:
</p>
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
