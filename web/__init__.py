__author__ = 'craig'
from flask import Flask, session, request
# from flask_analytics import Analytics
from requests import post
import json
from datetime import timedelta

import os
import sys
import locale
import logging
from config import basedir


'''
    Things to note:
        Pushing to master:
            - Make sure the server is set accordingly below
            - The braintree client getter method should be set to the client token getter. Found in views.py

'''


app = Flask(__name__)
app.secret_key = 'secret'

app.config.from_object('config')
app.permanent_session_lifetime = timedelta(days=31)

# Analytics(app)
# app.config['ANALYTICS']['GOOGLE_ANALYTICS']['ACCOUNT'] = 'XXXXXXXXXXXXX'


# API SELECTION
# Uncomment the api source that you would like to use, totally independent of the web app

# PRODUCTION
api_base_url = 'https://api.serveraddress.com'
DEBUG = False

# TESTING
# api_base_url = 'https://test.serveraddress.com/api' # For the testing server !
# DEBUG = True

# LOCAL ROUTER
# api_base_url = 'http://localhost:8000/api'
# DEBUG = True

# LOCAL
# api_base_url = 'http://localhost:8000'
# DEBUG = True

api_v1_1_url = api_base_url + '/v1.1'


def set_auth(email, token):
    session['email'] = email
    session['token'] = token
    return

def get_auth_email():
    return session.get('email', None)

def get_auth_token():
    return session.get('token', None)

def logout():
    data = {'email': get_auth_email(), 'token': get_auth_token()}
    post(api_base_url + "/logout", data=json.dumps(data))
    session.pop('email')
    session.pop('token')
    return

from web import views