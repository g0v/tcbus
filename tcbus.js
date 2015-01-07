
var theMap;
var RouteDB = {};
var StopDB = {};

$( function () {

function loadJson(url) {
    $.ajax({
	url: url,
	async: false,
	success: function(data, textStatus) { result = data; },
	error: function(jqXHR, textStatus) { alert('json file "' + url + '" read error: ' + textStatus); }
    });
    return result;
}

function onClickStop(e) {
    stop = e.target.stop;
    details = "<strong>站牌編號</strong>: " + stop.id  +
	"<br />\n<strong>站名</strong>: " + stop.name +
	"<br />\n<strong>路線</strong>: " + stop.routeList[0].name;
    for (i=1; i<stop.routeList.length; ++i)
	details += "、 " + stop.routeList[i].name;
    $("#stop_details").html(details);
}

function onClickRoute(e) {
    route = e.target.route;
    info = "<strong>路線名稱</strong>:" + route.name +
	"<br />\n<strong>起站</strong>:" + route.stopList[route.firstStop].name +
	"<br />\n<strong>迄站</strong>:" + route.stopList[route.lastStop].name;
    $("#route_summary").html(info);
    info = "<table border=1>\n<tr><th>序號 <th>站名 <th>站牌編號\n";
    for (i=0; i<route.stopList.length; ++i) {
	if(typeof route.stopList[i] == 'undefined') continue;
	s = route.stopList[i];
	info += "<tr><td>" + i + "<td>" + s.name + "<td>" + s.id + "\n";
    }
    info += "</table>";
    $("#route_details").html(info);
}

function loadRoute(rt_id) {

    loaded = loadJson('json/route-' + rt_id + '.json');
    loaded = loaded[0].PT;	// 目前只處理去程
    rt = RouteDB[rt_id] = {
	stopList: [],
	firstStop: 9999,
	lastStop: -1,
	coords: []
    };
    for (i=0; i < loaded.length; ++i) {
	p = loaded[i];
	rt.coords[i] = [Number(p.Lat), Number(p.Lon)];
    }
    rt.drawing = L.polyline(rt.coords, {
	weight: 5,
	color: '#008',
	dashArray: '8,6,2,6'
    });
    rt.drawing.route = rt;	// 指回路線資料結構，要讓 event handler 用
    rt.drawing.on("click", onClickRoute);
    rt.drawing.addTo(theMap);

    loaded = loadJson('json/stops-' + rt_id + '.json');
    for (i=0; i < loaded.length; ++i) {
	s = loaded[i];
	if (s.GoBack != '1') continue;
	if (! StopDB.hasOwnProperty(s.Id)) {
	    // 第一次出現的站牌， 不曾出現在其他路線上
	    st = StopDB[s.Id] = {
		id: s.Id,
		name: s.nameZh,
		lon: s.longitude,
		lat: s.latitude,
		routeList: []
	    }
	    rt.name = s.routeId;
	    st.drawing = L.marker( [st.lat, st.lon], {
		title: st.name,
		icon: busIcon
	    } );
	    st.drawing.stop = st;
	    // 指回站牌資料結構，要讓 event handler 用
	    st.drawing.on("click", onClickStop);
	    st.drawing.addTo(theMap);
	}
	st = StopDB[s.Id];
	st.routeList[st.routeList.length] = rt;
	seqNo = Number(s.seqNo);
	myRoute = RouteDB[rt_id];
	myRoute.stopList[seqNo] = st;
	if (myRoute.firstStop > seqNo) myRoute.firstStop = seqNo;
	if (myRoute.lastStop < seqNo) myRoute.lastStop = seqNo;
    }
}

function unloadRoute(rt_id) {
    if (! RouteDB.hasOwnProperty(rt_id)) {
	console.log(rt_id);
	console.log(RouteDB);
	return;
    }
    rt = RouteDB[rt_id];
    for (i=0; i<rt.stopList.length; ++i) {
	if(typeof rt.stopList[i] == 'undefined') continue;
	st = rt.stopList[i];
	for (j=0; j<st.routeList.length; ++j) {
	    if (st.routeList[j] == rt) {
		st.routeList[j] = st.routeList[--st.routeList.length];
		break;
	    }
	}
	if (st.routeList.length > 0 && typeof st.routeList[0] != 'undefined') {
	    console.log("not deleting stop:");
	    console.log(st);
	}
	// 目前無效， 要期待 leaflet 0.8 ：
	// https://github.com/Leaflet/Leaflet/issues/4
	delete st.drawing;
	delete st;
    }
    // 目前無效， 要期待 leaflet 0.8 ：
    // https://github.com/Leaflet/Leaflet/issues/4
    delete rt.drawing;
    delete rt;
    delete RouteDB[rt_id];
}

// set up the theMap
theMap = new L.Map('tcbus_map_canvas');

// create the tile layer with correct attribution
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='theMap data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		
theMap.setView(new L.LatLng(24.136767,120.685047),15);
theMap.addLayer(osm);

var busIcon = L.icon({
    iconUrl: 'bus.png',
    iconSize: [16,17],
});

rsform = $("#rsform");
loaded = loadJson('json/all-routes.json');
for (rt_id in loaded) {
    rsform.append('<input type="checkbox" value="' + rt_id + '">' + loaded[rt_id] + '</input><br />\n');
}

$("#route_selector input:checkbox").change(function(e) {
    t = $(e.target);
    if (t.prop("checked")) {
	loadRoute(t.attr("value"));
	t.attr("disabled", true);
    } else {
	// unloadRoute(t.attr("value"));
    }
});

$("#route_selector h3").click(function(e) {
    if (rsform.is(':hidden'))
	rsform.show(600);
    else
	rsform.hide(600);
});


});
