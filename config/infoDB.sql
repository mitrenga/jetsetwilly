SELECT `ndx`, `name`, `score`, `completed`, `created`
FROM `rg_jsw_hallOfFame`
ORDER BY `ndx` DESC
LIMIT :limit
