"""

Annotate your services with @Service,
  these functions receive
    1) message payload
    2) user session
    3) message name/type

Add a service broker to your service,
built with the service_broker_factory.


If you want to see what services are registered,
look at ServiceBroker.listeners


"""
__all__ = ['service_broker_factory', 'ServiceBroker', 'Service']


import traceback
import logging
from beaker.middleware import SessionMiddleware

import simplejson as json
try:
    from xml.etree import ElementTree
except ImportError:
    from elementtree import ElementTree

log = logging.getLogger(__name__)

class ServiceDispatcher(object):
    
    def __init__(self):
        self.services_loaded = False
        
    def __call__(self, environ, start_response):
        if not self.services_loaded:
            self.load_services()
            self.services_loaded = True
        " wsgi app that handles all appcelerator messages "
        # TODO: support other session middleware
        session = environ['beaker.session']
        session.save()
        
        start_response('200 OK', [
            ('Content-Type', 'text/xml; charset=utf-8'),
            ('Pragma', 'no-cache'),
            ('Cache-Control', 'no-cache, no-store, private, must-revalidate'),
            ('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT')
        ])
        yield "<?xml version=\"1.0\"?><messages version='1.0' sessionid='%s'>"%session.id
        
        content_len = int(environ.get('CONTENT_LENGTH', '0')) # http://trac.edgewall.org/ticket/5697#comment:1
        input = environ['wsgi.input'].read(content_len)
        
        if input:
            req = ElementTree.fromstring(input)
            for r in self.respond(self.handle(session, req)):
                yield r
        
        yield "</messages>"
    
    def handle(self, session, req):
        " parse an incoming message or batch and pass to MessageBroker"
        for msg in req.getchildren():
            msgtype = msg.get('type')
            reqid = msg.get('requestid')
            payload = json.loads(msg.text)
            
            # TODO: match args with ruby/java
            responses = ServiceBroker.send(msgtype, payload, session)
            for responsetype,result in responses:
                yield responsetype,result,reqid
        
    def respond(self, responses=[]):
        " take results of messages sends and build response for client"
        for rsptype,rsp,reqid in responses:
            payload = json.dumps(rsp) # should we escape XML entities?
            yield ( 
      "<message requestid='%s' direction='OUTGOING' datatype='JSON' type='%s'><![CDATA[%s]]></message>"%(reqid, rsptype, payload)
            )

    def load_services(self):
        " if we are running with a pylons app, load files in 'services' directory"
        import os
            
        try:
            import pylons.config
            project_dir = pylons.config['pylons.paths']['root']
            if not project_dir:
                print 'Pylons is installed, but app is not inited, services will not be loaded'
                return
        except ImportError:
            print 'Unable to import pylons.config, services will not be automatically loaded'
            return
        
        project_name = os.path.basename(project_dir)
        services_dir = os.path.join(project_dir,'services')
        services = [f[:-3] for f in os.listdir(services_dir) if f.endswith('.py')]
        
        for service in services:
            import_stmt = 'import %s.services.%s'%(project_name, service)
            print import_stmt
            exec import_stmt in {}



def service_broker_factory(global_config, **local_conf):
    " factory for building a new service broker that implements the Appcelerator protocol"
    secret = local_conf.get('beaker.session_secret', 'vzabgjrnevatnalcnagf')
    return SessionMiddleware(ServiceDispatcher(), key='app_session_id', secret=secret)


class InMemoryServiceBroker(object):
    " singleton that dispatches incoming messages to @Service annotated functions"
    def __init__(self):
        self.listeners = {}
    
    def registerListener(self, msgtype, listener):
        try:
            self.listeners[msgtype].append(listener)
        except KeyError:
            self.listeners[msgtype] = [listener]
    
    def unregisterListener(self, msgtype, listener):
        try:
            self.listeners[msgtype] = [l for l in self.listeners[msgtype] if l != listener]
        except KeyError:
            print 'no listeners for %s found'%msgtype

    def send(self, msgtype, data, session):
        """ send a message to all listeners registered for that message type,
            yield tuples of (responsetype, listenerResult)
        """
        try:
            listeners = self.listeners[msgtype]
        except KeyError:
            print 'no listeners for [%s] message'%msgtype
            return
        
        for listener in listeners:
            try:
                result = listener(data, session, msgtype)
                
                if not result:
                    result = {}
                if listener.responsetype:
                    yield listener.responsetype, result
                else:
                    # TODO: should log
                    print 'no response for [%s -> %s] service'%(msgtype, listener.func_name)
            except:
                traceback.print_exc()

ServiceBroker = InMemoryServiceBroker()



def Service(request, response):
    " decorator to expose a service that can be dispatched to by the Appcelerator message broker"
    def _(func):
        arity = func.func_code.co_argcount
    
        if arity == 0:
            def listener(data, session, msgtype):
                return func()
        elif arity == 1:
            def listener(data, session, msgtype):
                return func(data)
        elif arity == 2:
            def listener(data, session, msgtype):
                return func(data, session)
        elif arity == 3:
            def listener(data, session, msgtype):
                return func(data, session, msgtype)
        else:
            print 'bad number of arguments for @Service annotated function, should be from 0 to 3'
        
        listener.responsetype = response
        listener.func_name = func.func_name
        ServiceBroker.registerListener(request, listener)
        return listener
    return _


