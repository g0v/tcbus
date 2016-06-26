/* global console, window, document, $, L */

var G = {
    routeDB: {},
    stopDB: {}
};

window.setTimeout(init.bind({ data: $.get('data/all-routes.csv')}), 500);

function routeStopsFileName(routeID) {
    return 'data/stops-' + routeID + '.geojson';
}

function routeTraceFileName(routeID) {
    return 'data/route-' + routeID + '.geojson';
}

function init() {
    G.theMap = new L.Map('tcbus_map_canvas');

    // create the tile layer with correct attribution
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='theMap data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.tileLayer(osmUrl, {attribution: osmAttrib}).addTo(G.theMap);
    G.theMap.setView([24.147, 120.696], 12);

    G.busIcon = L.icon({ iconUrl: 'bus.png', iconSize: [16,17] });

    // console.log(this);
    var allRoutes = this.data.responseText.split('\n').map(function (x) { return x.split(','); });
    allRoutes.forEach(function (x) {
	$('#rsform').append('<input type="checkbox" value="' + x[0] + '">' + x[1] + '</input><br />\n');
    });

    $('#route_selector input:checkbox').change(function(e) {
	var t = $(e.target);
	var routeID = t.attr('value');
	if (t.prop('checked')) {
	    var stops = $.getJSON(routeStopsFileName(routeID));
	    var trace = $.getJSON(routeTraceFileName(routeID));
	    $.when(stops, trace).done(addRoute.bind({routeID: routeID}));
	} else {
	    removeRoute(routeID);
	}
    });
}

function addRoute(stops, trace) {
    var routeID = this.routeID;
    var stopsLG = L.geoJson(stops[0]).addTo(G.theMap);
    var traceLG = L.geoJson(trace[0]).addTo(G.theMap);
    G.routeDB[routeID] = {
	firstStop: 9999,
	lastStop: -1,
	stopsLG: stopsLG,
	traceLG: traceLG
    };

    stopsLG.getLayers().forEach(function (x) {
        x.setIcon(G.busIcon);
	x.tooltip = L.tooltip({
	    target: x,
	    map: G.theMap,
	    html: x.feature.properties.name,
	    padding: '4px 8px'
        });
    });
    traceLG.setStyle({
        weight: 5,
        color: '#008',
        dashArray: '8,6,2,6'
    });
}

function removeRoute(routeID) {
    var n0 = Object.keys(G.theMap._layers).length;
    G.theMap.removeLayer(G.routeDB[routeID].stopsLG);
    G.theMap.removeLayer(G.routeDB[routeID].traceLG);
    delete G.routeDB[routeID];
    var n1 = Object.keys(G.theMap._layers).length;
    console.log('route ' + routeID + ' removed, total layers ' + n0 + ' -> ' + n1);
}

