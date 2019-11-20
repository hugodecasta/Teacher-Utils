<?php

$tools = scandir('./tools');
unset($tools[0]);
unset($tools[1]);
$arr = array();
foreach($tools as $id => $tool_file)
    $arr[] = $tool_file;
header('Content-Type: application/json');
echo json_encode($arr);

?>