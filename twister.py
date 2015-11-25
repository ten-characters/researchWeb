__author__ = 'greg'
from web import app as webapp

from tornado.wsgi import WSGIContainer
from tornado.ioloop import IOLoop
from tornado.web import FallbackHandler, RequestHandler, Application
import tornado.options


class MainHandler(RequestHandler):
    def get(self):
        self.write('Cyclone yo ass')
        tornado.options.define_logging_options()

tr = WSGIContainer(webapp)

application = Application(
    [
        (r"/tornado", MainHandler),
        (r".*", FallbackHandler, dict(fallback=tr)),
    ]
)

if __name__ == "__main__":
    application.listen(8001)
    IOLoop.instance().start()
