<?php

require_once 'app/svision/php/abstractAboutPage.php';

/**
 * The /about page: the story of the original Jet Set Willy and this remake,
 * with links to Wikipedia, the Spectrum Computing archive and Retro Games.
 */
class AboutPage extends AbstractAboutPage {

  protected function aboutData() {
    return [
      'image' => 'images/cover.png',
      'sections' => [
        [
          'heading' => 'The original game (1984)',
          'html' =>
            '<p>Jet Set Willy is the legendary sequel to Manic Miner, written by Matthew Smith and '.
            'published by Software Projects for the ZX Spectrum in 1984. Willy has bought a huge mansion '.
            'with the fortune from his mining days — but the morning after a wild party, his housekeeper '.
            'Maria refuses to let him go to bed until every room is tidy.</p>'.
            '<p>Sixty surreal rooms of pixel-perfect peril, a sprawling non-linear map and the mansion\'s '.
            'strange inhabitants made Jet Set Willy one of the defining games of the ZX Spectrum era, '.
            'famous even for its bugs — the notorious Attic Bug became a legend of its own.</p>',
        ],
        [
          'heading' => 'This remake',
          'html' =>
            '<p>This is a faithful remake of the original game. It runs directly in your web browser — '.
            'there is nothing to install and nothing to download, just open the page and play, free of '.
            'charge. The game supports keyboard, touch controls and gamepads.</p>',
        ],
        [
          'heading' => 'Other game',
          'html' =>
            '<p>Also try <a href="https://manicminer.free/" target="_blank" rel="noopener">Manic Miner</a> — '.
            'the original adventure of Miner Willy, remade for your browser as well.</p>',
        ],
      ],
      'links' => [
        ['label' => 'Jet Set Willy on Wikipedia', 'url' => 'https://en.wikipedia.org/wiki/Jet_Set_Willy'],
        ['label' => 'Matthew Smith on Wikipedia', 'url' => 'https://en.wikipedia.org/wiki/Matthew_Smith_(games_programmer)'],
        ['label' => 'Game archive on World of Spectrum', 'url' => 'https://worldofspectrum.net/item/0002589/'],
        ['label' => 'Retro Games — more classic remakes playable in your browser', 'url' => 'https://retrogames.free/'],
      ],
      'footer' =>
        '<p>An unofficial fan remake. The original game and its artwork belong to their authors. '.
        'Remake source code is available on <a href="https://github.com/mitrenga/jetsetwilly" target="_blank" rel="noopener">GitHub</a>.</p>',
    ];
  } // aboutData

} // AboutPage
