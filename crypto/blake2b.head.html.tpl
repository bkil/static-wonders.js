<!DOCTYPE html>
<html>
<head>
  <title>blake2b</title>
<body>
  <input autofocus oninput="document.querySelector('p').innerText=Array.from(blake2b(new TextEncoder().encode(value))).map(x=&gt;x.toString(16).padStart(2, 0)).join('')">
  <p>
