<?php

class DataCommand {
   
   var $files = [
      'global', 'menu',
      'room00', 'room01', 'room02', 'room03', 'room04', 'room05', 'room06', 'room07', 'room08', 'room09', 'room10', 'room11',
      'room12', 'room13', 'room14', 'room15', 'room16', 'room17', 'room18', 'room19', 'room20', 'room21', 'room22', 'room23',
      'room24', 'room25', 'room26', 'room27', 'room28', 'room29', 'room30', 'room31', 'room32', 'room33', 'room34', 'room35',
      'room36', 'room37', 'room38', 'room39', 'room40', 'room41', 'room42', 'room43', 'room44', 'room45', 'room46', 'room48',
      'room49', 'room50', 'room51', 'room52', 'room53', 'room54', 'room55', 'room56', 'room57', 'room58', 'room59', 'room60'
   ];

   public function execute($postData) {
     $result = [];
     foreach ($this->files as $file) {
  	    $dataJSON = file_get_contents('data/'.$file.'.json');
       $result[$file] = json_decode($dataJSON);
     }
     return $result;
   } // execute

} // class DataCommand

