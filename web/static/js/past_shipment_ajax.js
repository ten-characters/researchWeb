/**
 * Created by greg on 7/24/15.
 */
var Shipments;
var Driver;
var User;
var Ratings;
var prefilteredShipments;
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
        setInterval(function () {get_me()}, 120000);
    });
function callback(data){
        Trucks = data['trucks'];
        User = data['user'];
        Shipments = data['user']['finished_shipments'];
        prefilteredShipments = Shipments
        Ratings = data['user']['ratings_given'];
        sort_shipments();
        reloadhtml();
    }
function reloadhtml(){
    for(i in Shipments){
       if($('#' + Shipments[i]['_id']['$oid']).length == 0){
           $('main').append('<section id="' + Shipments[i]['_id']['$oid'] + '"></section>');
           $('#' + Shipments[i]['_id']['$oid']).append('<summary></summary>');
            $('#' + Shipments[i]['_id']['$oid']).append('<div class="details"></div>');
       }
        $('#' + Shipments[i]['_id']['$oid'] + ' summary').empty();
        $('#' + Shipments[i]['_id']['$oid'] + ' summary').append('<h4>Reference# '+ Shipments[i]['reference_numbers'][Shipments[i]['reference_numbers']['Primary']] +'</h4>\
                <h4>Delivered on: ' + time_get_date_time(Shipments[i]['time_finished']) +'</h4>\
                <h4>Accepted on: ' + time_get_date(Shipments[i]['time_accepted']) +'</h4>\
                <h4>Price $'+ Shipments[i]['price'] +'</h4>\
                <div class="rateit bigstars last" data-rateit-starwidth="32" data-rateit-starheight="32"></div>');
        $('.rateit').rateit();
        for (j=0; j<Ratings.length; j++){
            if(Shipments[i]['_id']['$oid'] == Ratings[j]['shipment_id']['$oid']){
                $('#' + Shipments[i]['_id']['$oid'] + ' summary .rateit').rateit('value', Ratings[j]['rating'] );
                $('#' + Shipments[i]['_id']['$oid'] + ' summary .rateit').rateit('readonly', true);
            }
        }
    }

}

$(document).ready(function() {
    $('main').on('click', '.rateit', function(){
       var value = $(this).rateit('value');
        var id = $(this).parent().parent().attr('id');
        $.post("/rate",{'email':email, 'token': token, 'trucker_rating': value, 'id': id}, function(){});
        $(this).rateit('readonly', true);
    });
});

function load_details(sec) {
    var id = sec.attr('id');
    var shipment;
    for (i in Shipments) {
        if (Shipments[i]['_id']['$oid'] == id) {
            shipment = Shipments[i];
        }
    }
    sec.children('.details').empty();
    var delivery_order_element;
    var bill_lading_element;
    if (shipment['delivery_order_path'].split('.')[1] == 'pdf') {
        delivery_order_element = '<a href="' + base_url + '/v1.0/download/' + shipment["delivery_order_path"] + '"><object class="doc" data="' + base_url + '/v1.0/download/' + shipment["delivery_order_path"] + '" type="application/pdf" width="20%" height="450px"><p>It appears you do not have a PDF plugin for this browser.</object></a>'
    }
    else if (shipment['delivery_order_path'].split('.')[1] == 'doc' || shipment['delivery_order_path'].split('.')[1] == 'docx') {
        delivery_order_element = '<a href="' + base_url + '/v1.0/download/' + shipment["delivery_order_path"] + '"><p class="doc">At this time we do not support <br>viewing Microsoft Word files. <br> Click to Download.</p></a>'
    }
    else {
        delivery_order_element = '<a href="' + base_url + '/v1.0/download/' + shipment["delivery_order_path"] + '"><img class="doc" src="' + base_url + '/v1.0/download/' + shipment['delivery_order_path'] + '" height="450px" width="20%"></a>'
    }
    if (shipment['bill_lading_path'].split('.')[1] == 'pdf') {
        bill_lading_element = '<a href="' + base_url + '/v1.0/download/' + shipment["bill_lading_path"] + '"><object class="doc" data="' + base_url + '/v1.0/download/' + shipment["bill_lading_path"] + '" type="application/pdf" width="20%" height="450px"><p>It appears you do not have a PDF plugin for this browser.</object></a>'
    }
    else if (shipment['bill_lading_path'].split('.')[1] == 'doc' || shipment['bill_lading_path'].split('.')[1] == 'docx') {
        bill_lading_element = '<a href="' + base_url + '/v1.0/download/' + shipment["bill_lading_path"] + '"><p class="doc">At this time we do not support <br>viewing Microsoft Word files. <br> Click to Download.</p></a>'
    }
    else {
        bill_lading_element = '<a href="' + base_url + '/v1.0/download/' + shipment["bill_lading_path"] + '"><img class="doc" src="' + base_url + '/v1.0/download/' + shipment['bill_lading_path'] + '" height="450px" width="20%"></a>'
    }
    var reference_numbers = '';
    if ('Reference' in shipment['reference_numbers']) {
        reference_numbers = reference_numbers + '<p>Reference# ' + shipment['reference_numbers']['Reference'] + '</p>';
    }
    if ('Bill of Lading' in shipment['reference_numbers']) {
        reference_numbers = reference_numbers + '<p>Bill of Lading# ' + shipment['reference_numbers']['Bill of Lading'] + '</p>';
    }
    if ('Booking' in shipment['reference_numbers']) {
        reference_numbers = reference_numbers + '<p>Booking# ' + shipment['reference_numbers']['Booking'] + '</p>';
    }
    if ('Customer' in shipment['reference_numbers']) {
        reference_numbers = reference_numbers + '<p>Customer# ' + shipment['reference_numbers']['Customer'] + '</p>';
    }
    if ('Delivery' in shipment['reference_numbers']) {
        reference_numbers = reference_numbers + '<p>Delivery# ' + shipment['reference_numbers']['Delivery'] + '</p>';
    }
    if ('Pickup' in shipment['reference_numbers']) {
        reference_numbers = reference_numbers + '<p>Pickup# ' + shipment['reference_numbers']['Pickup'] + '</p>';
    }
    var origin = '<p>Origin: ' + shipment['pickup_name'] + ' ' + shipment['pickup_address']['city'] + ' ' + shipment['pickup_address']['state'] + '</p>';
    var destination = '<p>Destination: ' + shipment['dropoff_name'] + ' ' + shipment['dropoff_address']['city'] + ' ' + shipment['dropoff_address']['state'] + '</p>';
    var size = '<p>Size: ' + shipment['size'] + ' pallets</p>';
    var weight = '<p>Weight: ' + shipment['weight'] + 'lbs</p>';
    var commodity = '<p>Commodity: ' + shipment['commodity'] + '</p>';
    var shipment_info = '<div class="shipment_info"><h4>Shipment Details</h4>' + reference_numbers + origin + destination + size + weight + commodity + '</div>';
    $.post("/get_driver",
        {
            'email': email,
            'token': token,
            'id': shipment['driver']['$oid']
        },
        function (data, status) {
            set_driver(data, delivery_order_element,bill_lading_element,shipment_info, sec)
        }
    );
}
function set_driver(data, delivery_order_element,bill_lading_element,shipment_info, sec){
    Driver = data['driver'];
    var driver_pic = '<img src="' + base_url + '/v1.0/download/' + Driver["profile_picture_path"] + '" height="45px" width="45px">';
    var driver_name = '<p>' + Driver['first_name'] + '</p>';
    var truck_pic = '<img src="' + base_url + '/v1.0/download/' + Driver['driver_info']["trucks"][0]['photo_path'] + '" height="128px" width="128px">';
    var trailer_pic = '<img src="' + base_url + '/v1.0/download/' + Driver['driver_info']["trailers"][0]['photo_path'] + '" height="128px" width="128px">';
    var driver_info = '<div class="driver_info"><h4>Driver Details</h4>' + driver_pic + driver_name + truck_pic + trailer_pic + '</div>';

    sec.children('.details').append(delivery_order_element + bill_lading_element + shipment_info + driver_info);
}