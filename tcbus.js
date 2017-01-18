/* global console, window, document, $, L */

var G = {
    routeDB: {},
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
        $('#rsform ul').append('<li><label><input type="checkbox" value="' + x[0] + '"/>' + x[1] + '</label></li>\n');
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
    
    // when click "reset_all_routes" button, all of checks will disappear
    $("#reset_all_routes").click(function (x) {
        $("form#rsform input:checkbox").each(function(ex) {
            var bus_route_number  = $(this).attr( "value" );
            var bus_route_checked = $(this).prop( "checked" );
            if ( bus_route_checked == true ) {
                removeRoute(bus_route_number);
                $(this).prop( "checked",false );
            }
        });
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
    traceLG: traceLG,
    };

    stopsLG.getLayers().forEach(function (x) {
        x.setIcon(G.busIcon);
    // change marker title after creation:
    // https://groups.google.com/forum/#!topic/leaflet-js/3bcC9sfgJ6k
    x._icon.title = x.feature.properties.name;
    });
    traceLG.setStyle({
        weight: 3,
        color: '#008',
        dashArray: '8,6,2,6'
    });
    traceLG.getLayers().forEach(function (x) {
    x.on('mouseover', function(e) {
        e.target.setStyle({
        color: '#f00',
        weight: 8,
        });
    });
    x.on('mouseout', function(e) {
        e.target.setStyle({
        color: '#008',
        weight: 3,
        });
    });
    var arrow = L.polylineDecorator(x, {
        patterns: [{
        offset: 80,
        repeat: 160,
        symbol: L.Symbol.arrowHead({
            pixelSize: 15,
            polygon: false,
            pathOptions: {
            stroke: true,
            color: '#008',
            }
        })
        }]
    });
    traceLG.addLayer(arrow);
    });
/*
var arrow = L.polyline([[24.1, 120.65], [24.2, 120.75]], {}).addTo(G.theMap);
example(arrow);
*/
}

function removeRoute(routeID) {
    var n0 = Object.keys(G.theMap._layers).length;
    G.theMap.removeLayer(G.routeDB[routeID].stopsLG);
    G.theMap.removeLayer(G.routeDB[routeID].traceLG);
    delete G.routeDB[routeID];
    var n1 = Object.keys(G.theMap._layers).length;
    console.log('route ' + routeID + ' removed, total layers ' + n0 + ' -> ' + n1);
}