<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">
	table { border-collapse: collapse; }
	div.time_table { float: left; margin: 8px; }
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

print "<h1>路線 $rid</h1>\n\n<p>查詢時刻： " . date("m/d H:i");
?>

<div class="time_table">
<table border=1 summary="去程">
<tr><th>站名 <th>抵達時間 <th>車牌
<?php
foreach ($table as $stop) {
    if ($stop->GoBack != 1) break;
    print "<tr><td>$stop->StopName <td>$stop->comeTime <td>$stop->carID\n";
}
?>
</table>
</div>

<div class="time_table">
<table border=1 summary="回程">
<tr><th>站名 <th>抵達時間 <th>車牌
<?php
foreach ($table as $stop) {
    if ($stop->GoBack != 2) continue;
    print "<tr><td>$stop->StopName <td>$stop->comeTime <td>$stop->carID\n";
}
?>
</table>
</div>
</body>


