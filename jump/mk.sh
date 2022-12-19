#!/bin/sh
O="$(readlink -f "$(dirname "$0")")"

base64 -w0 $O/secure-context-mixer.html |
{
  read DURI
  sed "s~((mixer))~'data:text/html;base64,$DURI'~g" $O/secure-context-fetch.html > $O/secure-context-fetch-dist.html
}
