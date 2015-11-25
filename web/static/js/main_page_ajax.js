/**
 * Created by greg on 7/20/15.
 */
var Trucks;
    var User;
    var Shipments;
    var Warehouses;
    var map_type = 'drivers';
    var map;
var Driver;
    var markers = [];

    $(document).ready(function() {

        function get_me(){
            $.post("/get_me",
                    {
                        'email': email,
                        'token': token
                    },
                    function (data, status) {
                        callback(data)
                    }
            );
        }
        get_me();
        setInterval(function () {get_me()}, 10000);
    });

    function callback(data){
        Trucks = data['trucks'];
        User = data['user'];
        Shipments = data['user']['shipments'];
        Warehouses = data['user']['used_warehouses'];
        reloadhtml();
        mapdraw();
    }
    function reloadhtml(){

        for(var i=0; i<Warehouses.length; i++){
            var check = '.' + Warehouses[i]['_id']['$oid'];
            if ($('.warehouse_select').children(check).length == 0){
                var to_append = ('<option class=\"' + Warehouses[i]['_id']['$oid'] + '\" value=\"' + Warehouses[i]['_id']['$oid'] + '\">' + Warehouses[i]['name'] + '</option>');
                $('.warehouse_select').append(to_append)
            }
        }
        for(i=0; i<Shipments.length; i++){
            var shipment_id = "#" + Shipments[i]['_id']['$oid'];
            if ($(shipment_id).length == 0){
                $('#tabs').append('<li id="'+ Shipments[i]['_id']['$oid'] + '" class="tab"></li>');
            }
            $(shipment_id).empty();
            if(Shipments[i]['is_in_transit']){
                $(shipment_id).append('<div id="statusColor" class="greenStatus"></div>');

            }
            else if(Shipments[i]['is_accepted']){
                $(shipment_id).append('<div id="statusColor" class="yellowStatus"></div>');
            }
            else{
                $(shipment_id).append('<div id="statusColor" class="redStatus"></div>');
            }
            $(shipment_id).append('<p>' + Shipments[i]['reference_numbers']['Primary'] + ' #' + Shipments[i]['reference_numbers'][Shipments[i]['reference_numbers']['Primary']] + '</p>');
            if(Shipments[i]['is_accepted']) {
                $.post("/get_driver",
                    {
                    'email': email,
                    'token': token,
                    'id': Shipments[i]['river']['$oid']
                    },
                    function (data, status) {
                    set_driver(data)
                    }
                );
                $(shipment_id).append('<img src="' + base_url + '/v1.0/download/' + Driver["profile_picture_path"] + '" class="truckerPicture">');
                $(shipment_id).append('<p class="firstName">' + Driver['first_name'] + '</p>');
                $(shipment_id).append('<img src="/static/stars/star-white32.png" width="20px" class="star"/><img src="/static/stars/star-white32.png" width="20px" class="star"/><img src="/static/stars/star-white32.png" width="20px" class="star"/><img src="/static/stars/star-white32.png" width="20px" class="star"/><img src="/static/stars/star-white32.png" width="20px" class="star"/>');
            }
            else{
                $(shipment_id).append('<img src="/static/pallet_icon.png" class="truckerPicture">');
                $(shipment_id).append('<p class="firstName">Finding Drivers...</p>');
            }
            if (Shipments[i]['delivery_order_path']) {
                $(shipment_id).append('<br><a href="' + base_url + '/v1.0/download/' + Shipments[i]["delivery_order_path"] + '" target="_blank"><button type="button">D.O.</button></a>');
                if(!(Shipments[i]['is_in_transit'] || Shipments[i]['is_accepted'])){
                    $(shipment_id).append('<button type="button" class="cancel">Cancel</button>');
                }
            }
            if (Shipments[i]['bill_lading_path']) {
                $(shipment_id).append('<a href="' + base_url + '/v1.0/download/' + Shipments[i]["bill_lading_path"] + '" target="_blank"><button type="button">B.O.L.</button></a>');
            }
            if (Shipments[i]['bill_lading_path']) {
                $(shipment_id).append('<a href="' + base_url + '/v1.0/download/' + Shipments[i]["bill_lading_path"] + '" target="_blank"><button type="button">P.O.D.</button></a>');
            }

            shipment_id = '.' + Shipments[i]['_id']['$oid'];
            if ($(shipment_id).length == 0) {
                $('#right').append('<div id="section" class="shipmentitem ' + Shipments[i]['_id']['$oid'] + '" name="' + Shipments[i]['_id']['$oid'] + '"></div>');
            }

            $(shipment_id).empty();
            $(shipment_id).append('<p>' + Shipments[i]['name'] + '</p>');
            $(shipment_id).append('<p>' + Shipments[i]['company_ref'] + '</p>');

        }
    }
function set_driver(data){
Driver = data['driver'];
}