<?php

class DataCommand {
   
   public function execute($postData) {
      $data = json_decode($postData);
      $mysqli = new mysqli($GLOBALS['dbHostname'], $GLOBALS['dbUser'], $GLOBALS['dbPassword'], $GLOBALS['dbName']);
      $data = $mysqli->query(sprintf ('INSERT INTO `rg_jsw_hallOfFame` (`name`, `score`) VALUES (\'%s\', %d)', $data->name, $data->score));
      $mysqli->close();
      return $data;
   } // execute

} // class DataCommand

