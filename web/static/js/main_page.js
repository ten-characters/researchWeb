/**
 * Created by greg on 7/19/15.
 */
var new_ship_progress;
var used_reference_fields = ['Reference'];
$(document).ready(function(){
    $('#loading').hide();
    new_ship_progress = document.getElementById("new_shipment_form_progress").getContext("2d");
    var prog_fill = new_ship_progress.createLinearGradient(100,50,0,45);
    prog_fill.addColorStop(1,"#8800dd");
    prog_fill.addColorStop(0,"#aa00ff");
    $('input.timepicker').timepicker({'scrollDefault': 'now', 'timeFormat': 'h:i A'});
    $('#new_shipment_button').click(function(){
        $('.new_shipment_box').show();
        $('#what_box').fadeIn();
        $('#map-canvas').fadeTo(500,0.4);
        new_ship_progress.fillStyle = prog_fill;
        new_ship_progress.fillRect(0,0,10,20);
    });
    $('#close').click(function(){
        $('.new_shipment_box').hide();
        $('#map-canvas').fadeTo(500,1);
    });
    $('#what_next').click(function(){
        if(what_next_valid()) {
            $('#where_box').slideDown();
            $('#what_box').slideUp();
            new_ship_progress.clearRect(0, 0, 300, 20);
            new_ship_progress.fillStyle = prog_fill;
            new_ship_progress.fillRect(0, 0, 100, 20);
        }
    });
    $('#where_next').click(function(){
        if(where_next_valid()) {
            $('#when_box').slideDown();
            $('#where_box').slideUp();
            new_ship_progress.clearRect(0, 0, 300, 20);
            new_ship_progress.fillStyle = prog_fill;
            new_ship_progress.fillRect(0, 0, 200, 20);
        }
    });
    $('#where_back').click(function(){
        $('#what_box').slideDown();
        $('#where_box').slideUp();
        new_ship_progress.clearRect(0,0,300,20);
        new_ship_progress.fillStyle = prog_fill;
        new_ship_progress.fillRect(0,0,10,20);
    });
    $('#when_next').click(function() {
        if (when_next_valid()) {
            if ($('#pickup_id').val() == '') {
                var start_loc = $('#pwhzip').val();
            }
            else {
                for (i = 0; i < Warehouses.length; i++) {
                    if ($('#pickup_id').val() == Warehouses[i]['_id']['$oid']) {
                        var start_loc = Warehouses[i]['address']['zip']
                    }
                }
            }


            if ($('#dropoff_id').val() == '') {
                var end_loc = $('#dwhzip').val();
            }
            else {
                for (i = 0; i < Warehouses.length; i++) {
                    if ($('#dropoff_id').val() == Warehouses[i]['_id']['$oid']) {
                        var end_loc = Warehouses[i]['address']['zip']
                    }
                }
            }
            $('#when_box').slideUp();
            $('#loading').show();
            $.post('/get_price', {
                    start: start_loc,
                    end: end_loc,
                    weight: $('#weight').val(),
                    commodity: $('#commodity').val()
                },
                function (data, status) {
                    callback_price(data)
                });

        }
    });
    $('#when_back').click(function(){
        $('#where_box').slideDown();
        $('#when_box').slideUp();
        new_ship_progress.clearRect(0,0,300,20);
        new_ship_progress.fillStyle = prog_fill;
        new_ship_progress.fillRect(0,0,100,20);
    });
    $('#price_back').click(function(){
        $('#when_box').slideDown();
        $('#price_box').slideUp();
        new_ship_progress.clearRect(0,0,300,20);
        new_ship_progress.fillStyle = prog_fill;
        new_ship_progress.fillRect(0,0,290,20);
    });
    $('#shipments_tabs').on('click','.tab_head',function(){
        $(this).parent().css('height', 120);
        $(this).parent().css('width', 600);
        $(this).next().slideDown('slow');
    });
    $('.newpwh').click(function(){
            $('.pickup option').prop('selected', false)
                   .filter('[value=""]')
                   .prop('selected', true);
            $('#pickup_warehouse_select').css('margin-top', 0);
            $('.newpuwh').toggle();
        });
        $('.newdwh').click(function(){
            $('.dropoff option').prop('selected', false)
                   .filter('[value=""]')
                   .prop('selected', true);
            $('#dropoff_warehouse_select').css('margin-top', 0);
            $('.newdowh').toggle();
    });
    $('#tabs').on('click','.cancel',function(){
        shipment_id = $(this).parent().attr('id');
        $('#cancel_link').attr('href',"/cancel/" + shipment_id);
        $('#cancel_confirm').show();
    });
    $('#cancel_no').click(function(){
        $('#cancel_link').attr('href', "");
        $('#cancel_confirm').hide();
    });


    var ref_fields = 0;
    $('#reference_fields').on('click','.minus', function(){
        var ref_val_to_add = $(this).parent().children('select').children(':selected').val();
        used_reference_fields.splice(used_reference_fields.indexOf(ref_val_to_add),1);
        for(k=0; k<=ref_fields; k++){
            $('.reference_select_num_' + k).append('<option value="' + ref_val_to_add + '">' + ref_val_to_add + ' #</option>');
        }
        $(this).parent().remove();
        ref_fields -= 1;
        if(ref_fields < 3){
            $('.plus').show()
        }
    });
    $('.plus').click(function(){
        $(this).before('<div><select class="reference_select_num_' + (ref_fields +1) + ' reference_select"><option value="Bill of Lading">Bill of Lading #</option><option value="Booking">Booking #</option><option value="Customer">Customer #</option><option value="Delivery">Delivery #</option><option value="Reference" selected>Reference#</option><option value="Pickup">Pickup #</option></select><input type="text" name="Reference"> <button class="minus" type="button"><b>-</b></button> </div>');
        ref_fields += 1;
        if(ref_fields >= 3){
            $(this).hide()
        }
        for (i in used_reference_fields){
            var options = $('.reference_select_num_' + ref_fields).children();
            for(j in options){
                if(options[j].value == used_reference_fields[i]){
                    options[j].remove();
                }
            }
            var new_ref_val = $('.reference_select_num_' + ref_fields).children(':selected').val();
            used_reference_fields.push(new_ref_val);
        }
        for(k=0; k<ref_fields; k++){
            var options_to_check = $('.reference_select_num_' + k).children();
            for(l in options_to_check){
                if(options_to_check[l].value == new_ref_val){
                    options_to_check[l].remove();
                }
            }
        }

    });
    $('#reference_fields').on('change', 'select', function(){
        $(this).next().attr('name',$(this).val());
    });
    $('#reference_fields').on('change', '.primary', function(){
        $(this).next().next().val($(this).val());
    });
    //geocode zipcodes
    $('#pwhzip').change(function(){
        if(this.textLength == 5){
            $.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + $(this).val() + "&sensor=true", function(data){
                $('#pwhcity').val(data['results'][0]['address_components'][1]['long_name']);
                if(data['results'][0]['address_components'][2]['types'][0] == "administrative_area_level_1") {
                    $('#pwhstate').val(data['results'][0]['address_components'][2]['short_name']);
                }
                else{
                    $('#pwhstate').val(data['results'][0]['address_components'][3]['short_name']);
                }
            });
        }
    });
    $('#pwhzip').keypress(function(){$(this).change()});
    $('#dwhzip').change(function(){
        if(this.textLength == 5){
            $.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + $(this).val() + "&sensor=true", function(data){
                $('#dwhcity').val(data['results'][0]['address_components'][1]['long_name']);
                if(data['results'][0]['address_components'][2]['types'][0] == "administrative_area_level_1") {
                    $('#dwhstate').val(data['results'][0]['address_components'][2]['short_name']);
                }
                else{
                    $('#dwhstate').val(data['results'][0]['address_components'][3]['short_name']);
                }
            });
        }
    });

    $('.check-item').click(function(){
       $(this).find('input').each(function () {
           this.checked = !this.checked;
       });
    });

});

$(function() {
    $( "#from" ).datepicker({
        changeMonth: true,
        numberOfMonths: 1,
        minDate: 0,
        onClose: function( selectedDate ) {
            $( "#to" ).datepicker( "option", "minDate", selectedDate );
        }
    });
    $( "#to" ).datepicker({
        changeMonth: true,
        numberOfMonths: 1,
        minDate: 0,
        onClose: function( selectedDate ) {
            $( "#from" ).datepicker( "option", "maxDate", selectedDate );
        }
    });

});
//VALIDATORS
function what_next_valid(){
    if($('#commodity').val() != ''){
        if($('#primary_ref').val() != ''){
            if($('#num_pallets').val() != ''){
               if($('#size_l').val() != ''){
                    if($('#size_w').val() != ''){
                        if($('#size_h').val() != ''){
                            if($('#weight').val() != ''){
                                if($('#num_pieces_per_pallet').val() != ''){
                                   return true;
                                }
                                $('#num_pieces_per_pallet').effect("shake", { direction: "up", times: 4, distance: 5});
                                $('#num_pieces_per_pallet').css('border','2px solid red');
                                return false;
                            }
                            $('#weight').effect("shake", { direction: "up", times: 4, distance: 5});
                            $('#weight').css('border','2px solid red');
                            return false;
                        }
                        $('#size_h').effect("shake", { direction: "up", times: 4, distance: 5});
                        $('#size_h').css('border','2px solid red');
                        return false;
                    }
                   $('#size_w').effect("shake", { direction: "up", times: 4, distance: 5});
                   $('#size_w').css('border','2px solid red');
                   return false;
                }
                $('#size_l').effect("shake", { direction: "up", times: 4, distance: 5});
                $('#size_l').css('border','2px solid red');
                return false;
            }
            $('#num_pallets').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#num_pallets').css('border','2px solid red');
            return false;
        }
        $('#primary_ref').effect("shake", { direction: "up", times: 4, distance: 5});
        $('#primary_ref').css('border','2px solid red');
        return false;
    }
    $('#commodity').effect("shake", { direction: "up", times: 4, distance: 5});
    $('#commodity').css('border','2px solid red');
    return false;
}
function where_next_valid(){
    var pickup_valid = true;
    var dropoff_valid = true;
    if($('#pickup_id').val() == '') {
        if ($('#pwhcompanyname').val() == '') {
            pickup_valid = false;
            $('#pwhcompanyname').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhcompanyname').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
        if ($('#pwhcontactname').val() == '') {
            pickup_valid = false;
            $('#pwhcontactname').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhcontactname').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
        if ($('#pwhemail').val() == '') {
            pickup_valid = false;
            $('#pwhemail').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhemail').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
        if ($('#pwhphone').val() == '') {
            pickup_valid = false;
            $('#pwhphone').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhphone').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
        if ($('#pwhaddress').val() == '') {
            pickup_valid = false;
            $('#pwhaddress').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhaddress').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
        if ($('#pwhzip').val() == '') {
            pickup_valid = false;
            $('#pwhzip').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhzip').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
        if ($('#pwhcity').val() == '') {
            pickup_valid = false;
            $('#pwhcity').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhcity').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
        if ($('#pwhstate').val() == '') {
            pickup_valid = false;
            $('#pwhstate').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#pwhstate').css('border','2px solid red');
            $('#pickup_id').css('border','2px solid red');
        }
    }

    if($('#dropoff_id').val() == '' && pickup_valid) {
        if ($('#dwhcompanyname').val() == '') {
            dropoff_valid = false;
            $('#dwhcompanyname').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhcompanyname').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
        if ($('#dwhcontactname').val() == '') {
            dropoff_valid = false;
            $('#dwhcontactname').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhcontactname').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
        if ($('#dwhemail').val() == '') {
            dropoff_valid = false;
            $('#dwhemail').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhemail').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
        if ($('#dwhphone').val() == '') {
            dropoff_valid = false;
            $('#dwhphone').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhphone').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
        if ($('#dwhaddress').val() == '') {
            dropoff_valid = false;
            $('#dwhaddress').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhaddress').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
        if ($('#dwhzip').val() == '') {
            dropoff_valid = false;
            $('#dwhzip').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhzip').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
        if ($('#dwhcity').val() == '') {
            dropoff_valid = false;
            $('#dwhcity').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhcity').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
        if ($('#dwhstate').val() == '') {
            dropoff_valid = false;
            $('#dwhstate').effect("shake", { direction: "up", times: 4, distance: 5});
            $('#dwhstate').css('border','2px solid red');
            $('#dropoff_id').css('border','2px solid red');
        }
    }

    if(dropoff_valid && pickup_valid){return true;}
    return false;
}
function when_next_valid(){
    var pickup_valid = true;
    var dropoff_valid = true;
    if($('#from').val() == ''){
        pickup_valid = false;
        $('#from').effect("shake", { direction: "up", times: 4, distance: 5});
        $('#from').css('border','2px solid red');
    }
    if($('#pickup_time_start').val() == ''){
        pickup_valid = false;
        $('#pickup_time_start').effect("shake", { direction: "up", times: 4, distance: 5});
        $('#pickup_time_start').css('border','2px solid red');
    }
    if($('#pickup_time_end').val() == ''){
        pickup_valid = false;
        $('#pickup_time_end').effect("shake", { direction: "up", times: 4, distance: 5});
        $('#pickup_time_end').css('border','2px solid red');
    }
    if($('#to').val() == ''){
        dropoff_valid = false;
        $('#to').effect("shake", { direction: "up", times: 4, distance: 5});
        $('#to').css('border','2px solid red');
    }
    if($('#dropoff_time_start').val() == ''){
        dropoff_valid = false;
        $('#dropoff_time_start').effect("shake", { direction: "up", times: 4, distance: 5});
        $('#dropoff_time_start').css('border','2px solid red');
    }
    if($('#dropoff_time_end').val() == ''){
        dropoff_valid = false;
        $('#dropoff_time_end').effect("shake", { direction: "up", times: 4, distance: 5});
        $('#dropoff_time_end').css('border','2px solid red');
    }

    if(pickup_valid && dropoff_valid){
        return true;
    }
    return false;
}
function callback_price(data){
    $('#price').empty();
    $('#price').append('Price: $' + data['price']);
    $('.amount').val(data['price']);
    $('#price_box').slideDown();
    $('#loading').hide();

    new_ship_progress.clearRect(0, 0, 300, 20);
    new_ship_progress.fillStyle = prog_fill;
    new_ship_progress.fillRect(0, 0, 290, 20);
}