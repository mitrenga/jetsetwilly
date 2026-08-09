<?php
  $appName = 'JET SET WILLY';
  $appDescription = 'Play JET SET WILLY online for free in your browser. Faithful remake of the legendary 1984 ZX Spectrum platform game with no download required.';
  $appPrefix = 'jsw';
  $appNoscript =
    '<h1>JET SET WILLY</h1>'.
    '<p>Jet Set Willy is the legendary sequel to Manic Miner, created by Matthew Smith and published by '.
    'Software Projects for the ZX Spectrum in 1984. Willy has bought a huge mansion with the fortune from '.
    'his mining days, but after a wild party his housekeeper refuses to let him sleep until every room is '.
    'tidy. Explore dozens of surreal rooms, collect all the scattered items and try to survive the '.
    'mansion\'s strange inhabitants.</p>'.
    '<p>This is a faithful remake of the original game that runs directly in your web browser. '.
    'There is nothing to install and nothing to download — just open the page and play. '.
    'Please enable JavaScript to start the game.</p>'.
    '<p><a href="about">More about Jet Set Willy and this remake</a></p>';
  $appOpenGraph = [
    'image' => 'images/poster.png',
  ];
  $appJsonLd = [
    'genre' => 'Platform game',
    'isBasedOn' => [
      '@type' => 'VideoGame',
      'name' => 'Jet Set Willy',
      'author' => ['@type' => 'Person', 'name' => 'Matthew Smith'],
      'publisher' => ['@type' => 'Organization', 'name' => 'Software Projects'],
      'datePublished' => '1984',
      'gamePlatform' => 'ZX Spectrum',
    ],
  ];
  require_once 'config/config.php';
  require_once 'app/svision/php/main.php';
