<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>CSS Wrangler</title>
</head>

<body>

<?php
$bookmarklet = file_get_contents('static/script/loader.js');
$bookmarklet = str_replace("\t", '', $bookmarklet);
$bookmarklet = str_replace("\n", '', $bookmarklet);
?>

<a href="<?=htmlspecialchars($bookmarklet)?>">CSS Wrangler (dev)</a>

</body>
</html>