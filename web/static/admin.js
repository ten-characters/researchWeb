d/**
 * Created by greg on 6/16/15.
 */

function apply(elem){

    method = method || "put"; // Set method to post by default if not specified.

// The rest of this code assumes you are not using a library.
// It can be made less wordy if you use one.
    var form = document.createElement("form");

    form.setAttribute("method", method);
    form.setAttribute("action", 'http://52.5.21.166/v1.0/apply/decision/' + elem);

    form.submit();

    var lis = document.getElementById(elem);
    lis.parentNode.removeChild(lis);

}
function reject(elem){
    reason = window.prompt("Reason","rejected for unknown");
    var form = document.createElement("form");
    method = method || "put"; // Set method to post by default if not specified.

// The rest of this code assumes you are not using a library.
// It can be made less wordy if you use one.

    form.setAttribute("method", method);
    form.setAttribute("action", 'http://api.truckpallet.com/v1.0/apply/decision/' + elem);
    var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", 'reason');
        hiddenField.setAttribute("value", reason);

    form.appendChild(hiddenField);
    document.body.appendChild(form);

    form.submit();

    var lis = document.getElementById(elem);
    lis.parentNode.removeChild(lis);

}
