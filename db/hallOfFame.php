<?php

class DataCommand {
   
   public function execute($postData) {
      $mysqli = new mysqli($GLOBALS['dbHostname'], $GLOBALS['dbUser'], $GLOBALS['dbPassword'], $GLOBALS['dbName']);
      $data = $mysqli->query('SELECT `name`, MAX(`completed`) as completed, MAX(`score`) as score FROM `rg_jsw_hallOfFame` GROUP BY `name` ORDER BY completed DESC, score DESC LIMIT 10');
      $mysqli->close();
      return $data;
   } // execute

} // class DataCommand

