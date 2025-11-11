SET @dbname = 'jsw2';

SET @query = CONCAT('CREATE DATABASE IF NOT EXISTS `', @dbname, '`');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = CONCAT('USE `', @dbname, '`');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS hallOfFame (
  `ndx` BIGINT(20) NOT NULL AUTO_INCREMENT,
  `name` CHAR(64) NOT NULL,
  `score` BIGINT(20) NOT NULL,
  PRIMARY KEY (`ndx`),
  INDEX (`score`)
);
