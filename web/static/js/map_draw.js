/**
 * Created by greg on 7/20/15.
 */
function mapdraw(change_bounds){
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var resultpath;
    var bounds = new google.maps.LatLngBounds();
        if(map_type == 'drivers'){
            bounds.extend(new google.maps.LatLng(myloc['lat'], myloc['lng']));
            for(m in markers){
                markers[m].setMap(null);
            }
            markers = [];
            for (var i=0; i<Trucks.length; i++){
                var loc= new google.maps.LatLng(Trucks[i][0], Trucks[i][1]);
                bounds.extend(loc);
                var mark = new google.maps.Marker({
                position: loc,
                map: map,
                title: "On Duty!",
                icon: '/static/truck.png'
                });
                markers.push(mark);
                mark.setMap(map);
            }
            if (change_bounds){
                map.fitBounds(bounds);
            }
        }
        else{

            var bounds = new google.maps.LatLngBounds();
            var shipment;
            for( i in Shipments){
                if (Shipments[i]['_id']["$oid"] == map_type){
                    shipment=Shipments[i];
                }
            }
            var puloc = new google.maps.LatLng(shipment['pickup_location'][0], shipment['pickup_location'][1]);
            var doloc = new google.maps.LatLng(shipment['dropoff_location'][0], shipment['dropoff_location'][1]);
            bounds.extend(puloc);
            bounds.extend(doloc);
            directionsService.route(
                {
                    origin: puloc,
                    destination: doloc,
                    provideRouteAlternatives: false,
                    travelMode: google.maps.TravelMode.DRIVING
                },
                function (result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(result);
                    }
                });

            directionsDisplay.setOptions( { suppressMarkers: true, preserveViewport: true } );
            directionsDisplay.setMap(map);

            markers[0].setMap(null);
            markers.shift();

            markers.push(directionsDisplay);

            var pumark = new google.maps.Marker({
                position: puloc,
                map: map,
                title: "Start",
                icon: '/static/STARTING_PIN.png'
                });
            var domark = new google.maps.Marker({
                position: doloc,
                map: map,
                title: "End",
                icon: '/static/checkered_pin.png'
                });
            markers[0].setMap(null);
            markers.shift();
            markers[0].setMap(null);
            markers.shift();
            markers.push(pumark);
            markers.push(domark);
            pumark.setMap(map);
            domark.setMap(map);

            for(m=0; m<markers.length-3;m++){
                markers[0].setMap(null);
                markers.shift()
            }
            if(shipment['is_accepted']){
                var driverloc = new google.maps.LatLng(shipment['driver_location'][0], shipment['driver_location'][1]);
                bounds.extend(driverloc);
                var drivermark = new google.maps.Marker({
                position: driverloc,
                map: map,
                title: "Start",
                icon: '/static/truck.png'
                });
                markers.push(drivermark);
                drivermark.setMap(map);
                var crumb_arr = [];
                for(crumb in shipment['tracked_locations']){
                    var crumbloc = new google.maps.LatLng(shipment['tracked_locations'][crumb]['location']['coordinates'][0], shipment['tracked_locations'][crumb]['location']['coordinates'][1]);
                    bounds.extend(crumbloc);
                    var crumbmark = new google.maps.Marker({
                    position: crumbloc,
                    map: map,
                    title: shipment['tracked_locations'][crumb]['time_stamp'],
                    icon: '/static/dot.png'
                    });
                    markers.push(crumbmark);
                    crumb_arr.push(crumbloc);
                    crumbmark.setMap(map);
                }
                var ship_path = new google.maps.Polyline({
                    path: crumb_arr,
                    geodesic: true,
                    strokeColor: '#500050',
                    strokeOpacity: 1.0,
                    strokeWeight: 5
                });
                markers.push(ship_path);
                ship_path.setMap(map);

            }
            if (change_bounds){
                map.fitBounds(bounds);
            }

        }
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
    }