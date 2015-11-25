__author__ = 'Greg'
import json
from web.decorators import authenticate
from web import get_auth_email, get_auth_token, logout, set_auth, DEBUG
from web.utility import DateTimeEncoder, twelve_to_twenty_four_hour_time, string_to_bool
from web import app, session, api_base_url, api_v1_1_url

from flask import render_template, request, url_for, redirect, make_response, abort, jsonify
from requests import post, get, put
import json
from pygeocoder import Geocoder, GeocoderError
import datetime
import os

'''
    Insert here: What is this file specifically for ?
'''

##########################################################################################
##########################################################################################

# General Todo:
# json.loads(resp._content.decode('utf-8')) == resp.json(), I think, at least in my experience


########### Landing Page #########################
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')


@app.route('/shipperInfo')
def shipper_info():
    return render_template('shipperInfo.html')


@app.route('/truckerInfo')
def trucker_info():
    return render_template('truckerInfo.html')


@app.route('/logInMobile')
def log_in_mobile():
    return render_template('logInMobile.html')


@app.route('/thankyou')
def thankyou():
    return render_template('thankyou.html', title='Thank You for Registering')
##########################################################


@app.route('/reset/email', methods=['GET', 'POST'])
def reset_password_email():
    if request.method == 'GET':
        return render_template('resetEmail.html', enteredEmail=False)
    # Else this is a POST request
    data = {'email': request.form['email']}
    email_reset_request = put(api_base_url + '/v1.0/account/reset', data=json.dumps(data))

    if email_reset_request.ok:
        return render_template('resetEmail.html', enteredEmail=True)
    return render_template('resetEmail.html', enteredEmail=False)


@app.route('/reset', methods=['GET', 'POST'])
@app.route('/reset?hash=<string:reset_hash>', methods=['GET', 'POST'])
def reset_password():
    """
       From the api docs (lol):
           base_api_v1.0/account/reset
           Two types, either asking for a reset or trying to reset.
           PUT - Asking
               - data:
                   - email
           POST - Trying to reset
               - data:
                   - email
                   - reset_hash
                   - new_password
    :return:
    """
    reset_hash = None
    if 'hash' in request.args:
        reset_hash = request.args['hash']

    if reset_hash is None:
        # This means that they have tried to reset their password through
        # the form!
        data = {'email': request.form['email'], 'reset_hash': request.form['reset_hash'], 'new_password': request.form['new_password']}
        reset_request = post(api_base_url + '/v1.0/account/reset', data=json.dumps(data))
        if reset_request.ok:
            return render_template('index.html')
        return render_template('oops.html')
    # Else then they have clicked the link in their god damn email
    return render_template('reset.html', reset_hash=reset_hash)


#########Real Landing Page################################
@app.route('/home')
def home(new_shipment=False):
    session.permanent = True
    if 'email' not in session:
        return redirect('/login')
    email = get_auth_email()
    token = get_auth_token()
    data = json.dumps({'email': email, 'token': token})
    resp = get(api_base_url + '/v1.0/me', data=data)
    resp = json.loads(resp._content.decode('utf-8'))

    # Braintree client token getter, pretty cool
    if DEBUG:
        client_token = "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiI5ZGJiMGM3Y2Y5MDJjZjAxYTZlYzVkNWNjYTNmMWM2ZjBlMjNlN2RmZTZiNDk5MDQzNTI4MWE3NWQxMzVlOGVjfGNyZWF0ZWRfYXQ9MjAxNS0wNy0wOFQyMTozNzowNC4xOTIyNTI3NDkrMDAwMFx1MDAyNm1lcmNoYW50X2lkPWRjcHNweTJicndkanIzcW5cdTAwMjZwdWJsaWNfa2V5PTl3d3J6cWszdnIzdDRuYzgiLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvZGNwc3B5MmJyd2RqcjNxbi9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzL2RjcHNweTJicndkanIzcW4vY2xpZW50X2FwaSIsImFzc2V0c1VybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC52ZW5tby5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIn0sInRocmVlRFNlY3VyZUVuYWJsZWQiOnRydWUsInRocmVlRFNlY3VyZSI6eyJsb29rdXBVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvZGNwc3B5MmJyd2RqcjNxbi90aHJlZV9kX3NlY3VyZS9sb29rdXAifSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1lIjoiQWNtZSBXaWRnZXRzLCBMdGQuIChTYW5kYm94KSIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJhbGxvd0h0dHAiOnRydWUsImVudmlyb25tZW50Tm9OZXR3b3JrIjp0cnVlLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYnJhaW50cmVlQ2xpZW50SWQiOiJtYXN0ZXJjbGllbnQzIiwibWVyY2hhbnRBY2NvdW50SWQiOiJzdGNoMm5mZGZ3c3p5dHc1IiwiY3VycmVuY3lJc29Db2RlIjoiVVNEIn0sImNvaW5iYXNlRW5hYmxlZCI6dHJ1ZSwiY29pbmJhc2UiOnsiY2xpZW50SWQiOiIxMWQyNzIyOWJhNThiNTZkN2UzYzAxYTA1MjdmNGQ1YjQ0NmQ0ZjY4NDgxN2NiNjIzZDI1NWI1NzNhZGRjNTliIiwibWVyY2hhbnRBY2NvdW50IjoiY29pbmJhc2UtZGV2ZWxvcG1lbnQtbWVyY2hhbnRAZ2V0YnJhaW50cmVlLmNvbSIsInNjb3BlcyI6ImF1dGhvcml6YXRpb25zOmJyYWludHJlZSB1c2VyIiwicmVkaXJlY3RVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbS9jb2luYmFzZS9vYXV0aC9yZWRpcmVjdC1sYW5kaW5nLmh0bWwiLCJlbnZpcm9ubWVudCI6Im1vY2sifSwibWVyY2hhbnRJZCI6ImRjcHNweTJicndkanIzcW4iLCJ2ZW5tbyI6Im9mZmxpbmUiLCJhcHBsZVBheSI6eyJzdGF0dXMiOiJtb2NrIiwiY291bnRyeUNvZGUiOiJVUyIsImN1cnJlbmN5Q29kZSI6IlVTRCIsIm1lcmNoYW50SWRlbnRpZmllciI6Im1lcmNoYW50LmNvbS5icmFpbnRyZWVwYXltZW50cy5zYW5kYm94LkJyYWludHJlZS1EZW1vIiwic3VwcG9ydGVkTmV0d29ya3MiOlsidmlzYSIsIm1hc3RlcmNhcmQiLCJhbWV4Il19fQ=="
    else:
        d = check_resp(resp)
        if d:
            return d
    if not (resp['user']['is_full_account']):
        redirect(url_for(".pendingInfo"))

        client_token = get(api_base_url + "/braintree/client_token", data=json.dumps({'email': get_auth_email(), 'token': get_auth_token()}))
        client_token = json.loads(client_token._content.decode('utf-8'))
        try:
            if client_token['code'] == 403:
                return redirect('/login')
            if client_token['new_token']:
                set_auth(email, client_token['new_token'])
                client_token = client_token['result']
        except KeyError:
            # print('no new token')
            client_token = client_token['result']

    trucks = get(api_base_url + '/v1.0/drivers', data=json.dumps({
        'email': get_auth_email(),
        'token': get_auth_token(),
        'location': resp['user']['location'],
        'rng': 50}))

    if not trucks.ok:
        return render_template('oops.html')

    trucks = json.loads(trucks._content.decode('utf-8'))
    d2 = check_resp(trucks)
    if d2:
        return d2
    trucks = json.loads(trucks['result'])
    email = get_auth_email()
    token = get_auth_token()

    return render_template('home.html',
                           title='Home',
                           base_url=api_base_url,
                           shipments=resp['user']['shipments'],
                           email=email,
                           token=token,
                           trucks=trucks,
                           warehouses=resp['user']['used_warehouses'],
                           user_name=resp['user']['company'],
                           role=resp['user']['user_type'],
                           client_token=client_token,
                           new_shipment=new_shipment,
                           location=resp['user']['location'])


##########################################################
@app.route('/cancel/<sid>')
def cancel(sid):
    data = {
        'email': get_auth_email(),
        'token': get_auth_token()
    }
    resp = post(api_base_url + '/v1.0/shipments/cancel/' + sid, data=data, json=data)
    resp = json.loads(resp._content.decode('utf-8'))

    d = check_resp(resp)
    if d:
        return d
    return redirect(url_for('.home'))


@app.route('/get_me', methods=['POST'])
def get_me():

    data = {'email': get_auth_email(), 'token': get_auth_token() }
    resp = get(api_base_url + '/v1.0/me', data=data)
    resp = json.loads(resp._content.decode('utf-8'))

    d = check_resp(resp)
    if d:
        return d
    trucks = get(api_base_url + '/v1.0/drivers', data=json.dumps({
        'email': get_auth_email(),
        'token': get_auth_token(),
        'location': resp['user']['location'],
        'rng': 50}))
    if trucks.status_code == 502:
        return render_template('oops.html')

    trucks = json.loads(trucks._content.decode('utf-8'))
    d2 = check_resp(trucks)
    if d2:
        return d2
    trucks = json.loads(trucks['result'])

    return make_response(jsonify(user=resp["user"], trucks=trucks), 200)


@app.route('/get_driver', methods=['POST'])
def get_driver():
    data = {'id': request.form['id'], 'email': get_auth_email(), 'token': get_auth_token()}
    resp = get(api_base_url + '/v1.0/driver_profile', data=json.dumps(data))
    resp = json.loads(resp._content.decode('utf-8'))

    d = check_resp(resp)
    if d:
        return d
    return make_response(jsonify(driver=resp['result']), 200)


##########Register########################################
@app.route('/register', methods=['GET', 'POST'])
@app.route('/register/<usertype>')
@app.route('/register/<usertype>?ref=<referral_code>')
def register(usertype=None, referral_code=None):

    """
    Second two options are for loading the page only, first by type
    and then by type and referral code --> aka for drivers

    Yes, the ? is query parameter notation. Yes, this is not technically a query parameter.
        Access query parameters from request.args.get('param')

    Should format data nicely so the API doesn't have to

    Ex sample urls:
        /register
        /register/driver
        /register/shipper
        /register/peanuts
        /register/driver?ref=840Xojf

    :param usertype: string, should either be 'driver', 'shipper', or 'warehouse'. Default just pulls up regular register page
    :param referral_code: a custom referral code to be given out by drivers. Here so they can have their own 'custom' urls
    :return:
    """
    if request.method == "GET":
        # Switch by user type
        return render_template('shortRegistration.html', usertype=usertype, referral_code=request.args.get('ref'), api_base_url=api_base_url)
#     Todo: Deal with admin applicants!
#     form_data = request.form
#     application_data = {}
#     if form_data['type'] == 'driver':
#         '''
#             in v1.1 needs:
#              email
#              password
#              type
#         '''
#         application_data['email'] = form_data['email']
#         application_data['first_name'] = form_data['first_name']
#         application_data['first_name'] = form_data['first_name']
#         application_data['first_name'] = form_data['first_name']
#
#     elif form_data['type'] == 'shipper':
#         '''
#             same for @warehouse
#             in v1.1 needs:
#              email
#              password
#              type
#              address
#              state
#              city
#              country
#              zip
#         '''
#         pass
#     elif form_data['type'] == 'warehouse':
#         pass
    application_data = request.form
    application_request = post(api_v1_1_url + '/user/apply', data=application_data)
    # Check if the application was processed correctly
    if application_request.ok:
        return render_template('thankyou.html')
    # If not, show a custom error page
    # Todo: categorize by error code
    return render_template('form_error.html')

##########################################################


#########Login page#######################################
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('index.html', signInFail=False, signingIn=True)

    data = {'email': request.form['email'], 'password': request.form['password']}
    resp = post(api_base_url + "/login", data=json.dumps(data))

    response_content = json.loads(resp._content.decode('utf-8'))

    # Should also check if they are a full account or not
    # Perhaps by doing a user query / a get me

    if resp.status_code != 200:
        # We have received an error!
        try:
            if response_content['code'] == 404 or response_content['code'] == 403:
                return render_template('index.html', signInFail=True, signingIn=True)
        except KeyError:
            # Check the response for any bad error codes
            # @greggie: what is d?
            d = check_resp(response_content)
            return d
    try:
        token = response_content['token']
    except KeyError:
        resp = make_response('Unauthenticated', 403)
        return resp

    set_auth(data['email'], token)
    return redirect(url_for('.pendingInfo'))


##########################################################
@app.route('/logout')
def logoutpage():
    if 'username'not in session:
        return redirect('/login')
    logout()
    return redirect('/login')


#########Shipments########################################
@app.route('/add_shipment', methods=['POST'])
def add_shipment():
    session.permanent = True
    req = request

    putime = request.form['pickup_time_start']
    dotime = request.form['dropoff_time_start']
    putime_end = request.form['pickup_time_end']
    dotime_end = request.form['dropoff_time_end']

    putime = request.form['pickup_date'] + ' ' + twelve_to_twenty_four_hour_time(putime)
    putime_end = request.form['pickup_date'] + ' ' + twelve_to_twenty_four_hour_time(putime_end)
    dotime = request.form['dropoff_date'] + ' ' + twelve_to_twenty_four_hour_time(dotime)
    dotime_end = request.form['dropoff_date'] + ' ' + twelve_to_twenty_four_hour_time(dotime_end)

    putime = datetime.datetime.strptime(putime, ('%m/%d/%Y %H:%M:%S'))
    dotime = datetime.datetime.strptime(dotime, ('%m/%d/%Y %H:%M:%S'))
    putime_end = datetime.datetime.strptime(putime_end, ('%m/%d/%Y %H:%M:%S'))
    dotime_end = datetime.datetime.strptime(dotime_end, ('%m/%d/%Y %H:%M:%S'))
    putime = DateTimeEncoder().encode(putime)
    dotime = DateTimeEncoder().encode(dotime)
    putime_end = DateTimeEncoder().encode(putime_end)
    dotime_end = DateTimeEncoder().encode(dotime_end)

    try:
        lift = string_to_bool(request.form['lift_gate'])
    except KeyError:
        lift = False
        pass
    try:
        jack = string_to_bool(request.form['jack'])
    except KeyError:
        jack = False
        pass
    try:
        lumper = string_to_bool(request.form['lumper'])
    except KeyError:
        lumper = False
        pass
    try:
        truck_load = string_to_bool(request.form['truck_load'])
    except KeyError:
        truck_load = False
        pass

    reference_numbers = {'Primary': request.form['primary']}
    try:
        reference_numbers['Reference'] = request.form['Reference']
    except KeyError:
        pass
    try:
        reference_numbers['Bill of Lading'] = request.form['Bill of Lading']
    except KeyError:
        pass
    try:
        reference_numbers['Booking'] = request.form['Booking']
    except KeyError:
        pass
    try:
        reference_numbers['Customer'] = request.form['Customer']
    except KeyError:
        pass
    try:
        reference_numbers['Delivery'] = request.form['Delivery']
    except KeyError:
        pass
    try:
        reference_numbers['Pickup'] = request.form['Pickup']
    except KeyError:
        pass

    data = {
        #todo: fix none type email
        'email': get_auth_email(),
        'token': get_auth_token(),
        'service': "web",
        'price': float(request.form['amount']),
        'payment_nonce': request.form['payment_method_nonce'],
        'commodity': request.form['commodity'],
        'weight': float(request.form['weight']),
        'num_pallets': request.form['num_pallets'],
        'num_pieces_per_pallet': request.form['num_pieces_per_pallet'],
        'size_l': request.form['size_l'],
        'size_w': request.form['size_w'],
        'size_h': request.form['size_h'],
        'reference_numbers': json.dumps(reference_numbers),
        'needs_liftgate': lift,
        'needs_jack': jack,
        'needs_lumper': lumper,
        'pickup_time': putime,
        'pickup_time_end': putime_end,
        'dropoff_time': dotime,
        'dropoff_time_end': dotime_end,
        'is_full_truckload': truck_load
    }
    if request.form['Pickup_id'] != "":
        data.update({'start_id': request.form['Pickup_id']})
    else:
        # Build the Start Warehouse! --> @greggie please try to make even silly lil comments like these
        data.update({
            'start_name': request.form['pwhcompanyname'],
            'start_contact_name': request.form['pwhcontactname'],
            'start_contact_phone': request.form['pwhphone'],
            'start_contact_email': request.form['pwhemail'],
            'start_address': request.form['pwhaddress'],
            'start_city': request.form['pwhcity'],
            'start_state': request.form['pwhstate'],
            'start_country': 'USA',
            'start_zip': request.form['pwhzip']
        })
        try:
           loc = Geocoder.geocode(data['start_address'] + " " + data['start_city'] + " " + data['start_state'])
        except(KeyError):
            abort(400)
        except GeocoderError:
            abort(500)
        data.update({'start_location_lat': loc.latitude})
        data.update({'start_location_lon': loc.longitude})

    if request.form['Dropoff'] != "":
        data.update({'end_id': request.form['Dropoff']})
    else:
        # Build the End Warehouse !
        data.update({
            'end_name': request.form['dwhcompanyname'],
            'end_contact_name': request.form['dwhcontactname'],
            'end_contact_phone': request.form['dwhphone'],
            'end_contact_email': request.form['dwhemail'],
            'end_address': request.form['dwhaddress'],
            'end_city': request.form['dwhcity'],
            'end_state': request.form['dwhstate'],
            'end_country': 'USA',
            'end_zip': request.form['dwhzip']
        })
        try:
           loc = Geocoder.geocode(data['end_address'] + " " + data['end_city'] + " " + data['end_state'])
        except(KeyError):
            abort(400)
        except GeocoderError:
            abort(500)
        data.update({'end_location_lat': loc.latitude})
        data.update({'end_location_lon': loc.longitude})

    r=request.files['delivery_order']
    ext=r.filename.rsplit('.', 1)[1]
    now = str(datetime.datetime.now()) #get miliseconds to append on the file name to avoid duplicates
    now = now.rsplit('.')[1]
    r.save(now + 'delivery_order.'+ext)
    files = open(now + 'delivery_order.'+ext, 'rb')
    # print(len(files.read())) do not un comment if you expect more than zero bytes
    p = post(api_base_url + '/v1.0/shipments/add', data=data, files={'delivery_order': ("delivery_order." + ext, files.read())})
    os.remove(now + 'delivery_order.'+ext)

    p = json.loads(p._content.decode('utf-8'))
    d = check_resp(p)
    if d:
        return d
    return home(True)


##########################################################
@app.route('/upload/<sid>', methods=["POST"])
def upload(sid):
    session.permanent = True
    r1=request
    r=request.files['file']
    ext=r.filename.rsplit('.', 1)[1]
    print('before save')
    r.save('file.' + ext)
    print('after save')
    files = open('file.' + ext, 'rb')
    print('after open')
    data = {
        'email': get_auth_email(),
        'token': get_auth_token(),
        'shipment_id': sid
    }
    # data = {'data': data}
    p=post(api_base_url + '/v1.0/upload/delivery_order', data=data, files={'file': ("file." + ext, files.read())})
    p = json.loads(p._content.decode('utf-8'))
    d = check_resp(p)
    if d:
        return d
    return redirect(url_for('.home'))


#########Past Shipment####################################
@app.route('/past_shipments')
def past_shipments():
    if 'email' not in session:
        return redirect('/login')
    email = get_auth_email()
    token = get_auth_token()
    data = json.dumps({'email': email, 'token': token})
    resp = get(api_base_url + '/v1.0/me', data=data)
    resp = json.loads(resp._content.decode('utf-8'))

    d = check_resp(resp)
    if d:
        return d
    if not (resp['user']['is_full_account']):
        redirect(url_for(".pendingInfo"))
    return render_template('past2.html',
                           title='Past Shipments',
                           base_url=api_base_url,
                           email=get_auth_email(),
                           token=get_auth_token(),
                           user_name=resp['user']['company'],
                           location=resp['user']['location'])

#lists all past shipments
##########################################################


@app.route('/rate', methods=['POST'])
def rate():
    reqdata = request.form
    data = {}
    data['email'] = reqdata['email']
    data['token'] = reqdata['token']
    data['trucker_rating'] = float(reqdata['trucker_rating'])
    resp = post(api_base_url + '/v1.0/rate/' + reqdata['id'], data=data)
    resp = json.loads(resp._content.decode('utf-8'))

    d = check_resp(resp)
    if d:
        return d
    return make_response(jsonify(status='rated'), 200)


@app.route('/get_price', methods=['POST'])
def get_price():
    reqdata = request.form
    data = {}
    data['start'] = reqdata['start']
    data['end'] = reqdata['end']
    data['email'] = get_auth_email()
    data['token'] = get_auth_token()

    start = Geocoder.geocode(data['start'])
    data['start_lat'] = start.latitude
    data['start_lng'] = start.longitude

    end = Geocoder.geocode(data['end'])
    data['end_lat'] = end.latitude
    data['end_lng'] = end.longitude

    resp = get(api_base_url + '/get_price', data=data)
    resp = json.loads(resp._content.decode('utf-8'))

    d = check_resp(resp)
    if d:
        return d
    return make_response(jsonify(price=resp['price']), 200)
#########Invoices#########################################
#need oauth
##########################################################


#########Admin############################################
@app.route('/admin/pending')
def get_apps_pending():
    session.permanent = True
    data = {'email': get_auth_email(), 'token': get_auth_token()}
    data = json.dumps(data)
    applications = get(api_base_url + "/v1.0/applications", data=data)
    applications = json.loads(applications._content.decode('utf-8'))
    d = check_resp(applications)
    if d:
        return d
    #if applications['code'] == 200:
    applications = applications['result']
    applications = json.loads(applications)
    return render_template('pending_apps.html', applications=applications, base_url=(api_base_url + '/v1.0/download/'))
    # else:
    #     return make_response(403)

@app.route('/apply/decision/<string:app_id>', methods=['POST'])
def apply_decision(app_id):
    session.permanent = True
    if 'reason' in request.form:
        reason = request.form['reason']
    else:
        reason = None

    if request.form['is_accepted'] == 'true':
        ia = True
    else:
        ia = False

    data = {'email': get_auth_email(), 'token': get_auth_token(), 'is_accepted': ia, 'reason': reason}
    data = json.dumps(data)
    p = post(api_base_url + "/v1.0/apply/decision/" + app_id, data=data)
    d = check_resp(json.loads(p._content.decode('utf-8')))
    if d:
        return d
    return make_response('good', 200)


##########################################################
def check_resp(resp):
    try:
        if resp['code'] == 500 or resp['code'] == 502:
            return render_template('oops.html')
        elif resp['code'] == 403:
            return redirect('/login')
        elif resp['code'] == 400:
            abort(400)
        elif resp['code'] == 404:
            abort(404)
    except KeyError:
        try:
            if resp['new_token']:
                set_auth(get_auth_email(), resp['new_token'])
        except KeyError:
            print('no new token')
        print('no bad code')

from datetime import timedelta


@app.before_request
def make_session_permanent():
    # Women and Women first.
    session.permanent = True
    app.permanent_session_lifetime = timedelta(days=5)