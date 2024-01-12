#!/bin/sh

escape_file() {
  cat "$@" |
  LC_ALL=c gawk '
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
