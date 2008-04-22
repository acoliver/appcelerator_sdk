from google.appengine.ext.webapp import util

from beaker.middleware import SessionMiddleware
import appcelerator

def main():
    servicebroker = appcelerator.service_broker_factory({})
    app = SessionMiddleware(servicebroker, key='__projectname___session_key', secret='secretsecretsecret')
    
    util.run_wsgi_app(app)

if __name__ == '__main__':
    main()
