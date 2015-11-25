/**
 * Created by greg on 7/24/15.
 */
// all full dates will be given in iso string yyyy-MM-ddTHH:mm:ss.milisec *note 24hour time

//returns the date MM/dd/yyyy
function time_get_date(full_date){
    var date = full_date.split("T")[0];
    date = date.split("-");
    date = date[1] + '/' + date[2] + '/' + date[0];
    return date;
}
function time_get_time(full_date){
    var time = full_date.split("T")[1];
    time = time.split(":");
    var meridiem = 'am';
    if(parseInt(time[0]) >= 12){
        time[0] = (parseInt(time[0])-12).toString();
        meridiem = 'pm';
    }
    else if (parseInt(time[0]) == 0){
        time[0] = (parseInt(time[0])+12).toString();
    }
    time = time[0] + ':' + time[1] + ' ' + meridiem;
    return time;
}
function time_get_date_time(full_date){
    var date = time_get_date(full_date);
    var time = time_get_time(full_date);
    var date_time = date + '  ' + time;
    return date_time;
}