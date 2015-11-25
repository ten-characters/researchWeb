__author__ = 'greg'
from json import JSONEncoder, JSONDecoder, loads
from datetime import datetime
class DateTimeEncoder(JSONEncoder):
    """ Instead of letting the default encoder convert datetime to string,
        convert datetime objects into a dict, which can be decoded by the
        DateTimeDecoder
    """
    def default(self, obj):
        if isinstance(obj, datetime):
            return {
                '__type__': 'datetime',
                'year': obj.year,
                'month': obj.month,
                'day': obj.day,
                'hour': obj.hour,
                'minute': obj.minute,
                'second': obj.second,
                'microsecond': obj.microsecond,
            }
        else:
            return JSONEncoder.default(self, obj)


# Updated from original gist.
# Added a failure return if the conversion was unsuccessful
class DateTimeDecoder(JSONDecoder):

    def __init__(self, *args, **kargs):
        JSONDecoder.__init__(self, object_hook=self.dict_to_object,
                             *args, **kargs)

    def dict_to_object(self, data):
        decode_failed = "failure"
        if '__type__' not in data:
            return decode_failed

        if isinstance(data, dict):
            type = data.pop('__type__', None)
            try:
                dateobj = datetime(**data)
                return dateobj
            except:
                data['__type__'] = type
                return decode_failed

        return decode_failed

def twelve_to_twenty_four_hour_time(twelve_hour_time):
    hours = int(twelve_hour_time.rsplit(':', 1)[0])
    minutes = twelve_hour_time.rsplit(':', 1)[1].rsplit(' ', 1)[0]
    meridiem = twelve_hour_time.rsplit(' ', 1)[1]
    if hours < 12:
        if meridiem == 'PM':
            hours += 12
    else:
        if meridiem == 'AM':
            hours = 0
    twenty_four_hour_time = str(hours) + ':' + minutes + ':00'
    return twenty_four_hour_time

def string_to_bool(string):
    keys = ['on', 'true', '1', 'yes']
    string = string.lower()
    for key in keys:
        if string == key:
            return True
    return False
