#!/bin/sh

base64 -w0 secure-context-mixer.html |
{
  read DURI
  sed "s~((mixer))~'data:text/html;base64,$DURI'~g" secure-context-fetch.html > secure-context-fetch-dist.html
}
