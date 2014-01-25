<?php
$interfaceHTML = file_get_contents('static/interface.html');
$interfaceHTML = preg_replace('/<!--[^\[](.|\s)*?-->/', '', $interfaceHTML);
$interfaceHTML = htmlspecialchars(str_replace(array("\t","\n"),'',$interfaceHTML));

?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Untitled Document</title>
</head>

<textarea width="800" height="600" style="width:800px;height:600px;"><?=$interfaceHTML?></textarea>

<body>
</body>
</html>