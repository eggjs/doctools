<!DOCTYPE html>
<html lang="{{ page.lang }}">
<head>
  <title>{{ page.title || 'egg' }} - {{ __('index.slogan') }}</title>
  <meta charset="utf-8">
  <meta name="description" content="{{ __('index.description') }}">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <link rel="icon" href="/images/favicon.png" type="image/x-icon">
  {{ partial('partial/head') }}
</head>
<body>
  {{ partial('partial/header') }}
  <div id="container">
    {{ body }}
  </div>
</body>
{{ partial('partial/foot') }}
</html>
