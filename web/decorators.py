__author__ = 'greg'
from web import session
from flask import redirect


def authenticate(f):
    def wrapper(*args, **kwargs):
        if 'username' in session:
            f
            return wrapper
        redirect('/login')
        return wrapper