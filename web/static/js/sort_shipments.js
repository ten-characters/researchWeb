/**
 * Created by greg on 7/27/15.
 */
function sort_shipments(){
    var sort_type = $('#sort_type').val();
    var sort_order = $('#sort_order').val();
    var sort_filter = $('#sort_filter').val();

    if(sort_filter  == ''){
        var filtered_shipments = prefilteredShipments;
    }
    else{
        var filtered_shipments = [];
        var unfiltered_shipments = prefilteredShipments;

        for (i in unfiltered_shipments){
            if(~unfiltered_shipments[i]['commodity'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['dropoff_address']['address'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['dropoff_address']['city'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['dropoff_address']['state'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['dropoff_address']['zip'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['pickup_address']['address'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['pickup_address']['city'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['pickup_address']['state'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['pickup_address']['zip'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['reference_numbers'][unfiltered_shipments[i]['reference_numbers']['Primary']].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~unfiltered_shipments[i]['time_finished'].indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
            else if(~time_get_date_time(unfiltered_shipments[i]['time_finished']).indexOf(sort_filter)){
                filtered_shipments.push(unfiltered_shipments[i]);
            }
        }

    }
    if(sort_type == 'pickup_time'){
            Shipments = _.sortBy(filtered_shipments, function(shipment){ return shipment['pickup_time']; });
        }
        else if(sort_type == 'dropoff_time'){
            Shipments = _.sortBy(filtered_shipments, function(shipment){ return shipment['time_finished']; });
        }
        else if(sort_type == 'rating'){
            Shipments = _.sortBy(filtered_shipments, function(shipment){ return shipment['driver_rating']; });
        }
        else if(sort_type == 'pickup_location'){
            Shipments = _.sortBy(filtered_shipments, function(shipment){ return shipment['pickup_address']['city']; });
        }
        else if(sort_type == 'dropoff_location'){
            Shipments = _.sortBy(filtered_shipments, function(shipment){ return shipment['dropoff_address']['city']; });
        }
        else if(sort_type == 'commodity'){
            Shipments = _.sortBy(filtered_shipments, function(shipment){ return shipment['commodity']; });
        }
        else if(sort_type == 'reference_number'){
            Shipments = _.sortBy(filtered_shipments, function(shipment){ return shipment['reference_numbers'][shipment['reference_numbers']['Primary']]; });
        }
    if(sort_order == 'decending'){
        Shipments = Shipments.reverse();
    }
}