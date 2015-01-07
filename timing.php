<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">
	table { border-collapse: collapse; }
	div.time_table { float: left; margin: 8px; }
	.small { font-size: 60%; }
    </style>

<?php
mb_parse_str($_SERVER["QUERY_STRING"], $qs);
$rid = array_key_exists('rid', $qs) ? $qs["rid"] : '151';
$table = file_get_contents("http://citybus.taichung.gov.tw/tcbus2/GetEstimateTime.php?routeIds=$rid");
print "<title>路線 $rid</title>";
?>

</head>

<body>
<?php
if (! $table) exit("讀取失敗");
$table = json_decode($table);
$table = $table->$rid;

function to_number($ts) {
    return substr($ts,0,2)*60 + substr($ts,3,2)*1;
}

function to_string($tn) {
    return sprintf("%02d:%02d", $tn/60, $tn%60);
}

$now = date("H")*60+date("i");
$forth = $back = array();
$forth_delta = $back_delta = NULL;
foreach ($table as $stop) {
    if ($stop->GoBack == 1) {
	array_push($forth, $stop);
	if (!isset($forth_delta) and strlen($stop->carID)>3)
	    $forth_delta = $stop->comeTime;
    } else {
	array_push($back, $stop);
	if (!isset($back_delta) and strlen($stop->carID)>3)
	    $back_delta = $stop->comeTime;
    }
}
$forth_delta = to_number($forth_delta) - $now;
$back_delta = to_number($back_delta) - $now;

print "<h1>路線 $rid</h1>\n\n<p>查詢時刻： " . date("m/d H:i") . "<br />\n";

print "去程時間校正： $forth_delta 分<br />\n";
print "回程時間校正： $back_delta 分<br />\n";
?>

<div class="time_table">

<table border=1 summary="去程">
<tr><th>站名 <th class='small'>抵達時間<br />(公告)<th>抵達時間<br />(重算)<th>車牌
<?php
foreach ($forth as $stop) {
    $time = strlen($stop->carID)>3 ?
	(to_string(to_number($stop->comeTime) - $forth_delta)) . " + ?" : '';
    print "<tr><td>$stop->StopName <td class='small'>$stop->comeTime <td>$time <td>$stop->carID\n";
}
?>
</table>
</div>

<div class="time_table">
<table border=1 summary="回程">
<tr><th>站名 <th class='small'>抵達時間<br />(公告)<th>抵達時間<br />(重算)<th>車牌
<?php
foreach ($back as $stop) {
    $time = strlen($stop->carID)>3 ?
	(to_string(to_number($stop->comeTime) - $back_delta)) . " + ?" : '';
    print "<tr><td>$stop->StopName <td class='small'>$stop->comeTime <td>$time <td>$stop->carID\n";
}
?>
</table>
</div>
</body>


