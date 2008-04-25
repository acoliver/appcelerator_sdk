"""

Annotate your services with @Service,
  these functions receive
    1) message payload
    2) user session
    3) message name/type

Add a service broker to your wsgi app,
built with the service_broker_factory.
(This is done automatically for projects generated for pylons)


If you want to see what services are registered,
look at ServiceBroker.listeners


"""
__all__ = ['service_broker_factory', 'cross_domain_proxy_factory', 'ServiceBroker', 'Service']


import traceback
import logging
import cgi
import urllib2 as urllib

import simplejson as json

try:
    from xml.etree import ElementTree
    ElementTree.fromstring('<test></test>') # force loading expat, may fail
except ImportError:
    from elementtree import ElementTree
    from elementtree import SimpleXMLTreeBuilder
    # more work arounding for the xmlpath
    def fromstring(text):
        parser = SimpleXMLTreeBuilder.TreeBuilder()
        parser.feed(text)
        return parser.close()
    
    ElementTree.fromstring = fromstring



class ServiceDispatcher(object):
    " wsgi app that handles all appcelerator messages "
    
    # the inital request comes as an empty form-encoded message
    KNOWN_MIMETYPES = ['text/xml', 'application/json', 'application/x-www-form-urlencoded']
    services_loaded = False
            
    def __call__(self, environ, start_response):
        if not self.services_loaded:
            _load_services()
            self.services_loaded = True
        
        session = environ['beaker.session']
        
        mimetype = environ.get('CONTENT_TYPE','')
        if mimetype:
            mimetype = mimetype.split(';')[0]
        else:
            mimetype = 'text/xml'
        
        input = get_input(environ)
        
        if mimetype not in self.KNOWN_MIMETYPES:
            logging.error('Unhandled MimeType: '+mimetype)
            start_response('406 Not Acceptable', [])
            return
            
        start_response('200 OK', [
            ('Content-Type', mimetype+'; charset=utf-8'),
            ('Pragma', 'no-cache'),
            ('Cache-Control', 'no-cache, no-store, private, must-revalidate'),
            ('Expires', 'Mon, 26 Jul 1997 05:00:00 GMT')
        ])
        
        #
        # The old-style, xml-wrapped protocol
        if mimetype.startswith('text/xml'):
            yield "<?xml version=\"1.0\" encoding=\"UTF-8\"?><messages version='1.0' sessionid='%s'>"%session.id
            if input:
                messages = self.extract_messages_from_xml(input)
                for rsp in self.handle_messages(messages, session, {}):
                    payload = json.dumps(rsp['data'], cls=_JsonEncoder)
                    yield (
"<message requestid='%s' direction='OUTGOING' datatype='JSON' type='%s'><![CDATA[%s]]></message>"%(rsp['incoming']['requestid'], rsp['type'], payload)
                    )
            yield "</messages>"
        
        #
        # The new-style, all-json protocol
        elif mimetype.startswith('application/json'):
            if input:
                payload = json.loads(input, object_hook=_decoder_hook)
                options = {
                    'request': payload['request'],
                    'environ': environ
                }
                
                messages = payload['request']['messages']
                results = self.handle_messages(messages, session, options)
                responses = [
                    {'direction': 'OUTGOING',
                     'datatype': 'JSON',
                     'requestid': rsp['incoming']['requestid'],
                     'type': rsp['type'],
                     'data': rsp['data']}
                    for rsp
                    in results
                ]
            else:
                responses = []
            
            yield json.dumps({'sessionid': session.id, 'messages': responses}, cls=_JsonEncoder)
    
    def extract_messages_from_xml(self, input):
        req = ElementTree.fromstring(input)
        for msg in req.getchildren():
            yield {
                'type': msg.get('type'),
                'requestid': msg.get('requestid'),
                'data': json.loads(msg.text, object_hook=_decoder_hook)
            }
    
    def handle_messages(self, messages, session, options):
        " parse an incoming message or batch and pass to MessageBroker"
        for message in messages:
            for response in ServiceBroker.send(message, session, options):
                yield response


class _default_CrossDomainProxy(object):
    
    SUPPRESSED_HEADERS = ('transfer-encoding','set-cookie')    
    
    def __call__(self, environ, start_response):
        fields = cgi.parse_qs(environ['QUERY_STRING'])
        url = fields.get('url', None)
        if not url:
            start_response('400 Bad Request', [])
            return []
        else:
            url = url[0]
            if '://' not in url:
                url = urllib.unquote(url)
            proxied_request = urllib.urlopen(url)
            
            headers = [header for header in proxied_request.headers.items()
                       if header[0].lower() not in self.SUPPRESSED_HEADERS]
            
            start_response('200 OK', headers)
            return [proxied_request.read()]


class _appengine_CrossDomainProxy(object):
    
    SUPPRESSED_HEADERS = ('transfer-encoding','set-cookie')    
    
    def __call__(self, environ, start_response):
        fields = cgi.parse_qs(environ['QUERY_STRING'])
        url = fields.get('url', None)
        if not url:
            start_response('400 Bad Request', [])
            return []
        else:
            url = url[0]
            if '://' not in url:
                url = urllib.unquote(url)
            proxied_request = urlfetch.fetch(url)
            
            headers = [header for header in proxied_request.headers.items()
                       if header[0].lower() not in self.SUPPRESSED_HEADERS]
            
            start_response('200 OK', headers)
            return [proxied_request.content]


def service_broker_factory(global_config, **local_conf):
    " factory for building a new service broker that implements the Appcelerator protocol"
    return ServiceDispatcher()

def cross_domain_proxy_factory(global_config, **local_conf):
    " factory for building a new proxy to bounce requests to non-local domains "
    return CrossDomainProxy()


def get_input(environ):
    # http://trac.edgewall.org/ticket/5697#comment:1
    try:
        content_len = int(environ['CONTENT_LENGTH'])
        return environ['wsgi.input'].read(content_len)
    except:
        return environ['wsgi.input'].read()


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
            logging.warn('no listeners for %s found'%msgtype)

    def send(self, message, session, options):
        """ send a message to all listeners registered for that message type,
            yield tuples of (responsetype, listenerResult)
        """
        msgtype = message['type']
        data = message['data']
        
        try:
            listeners = self.listeners[msgtype]
        except KeyError:
            logging.warn('no listeners for [%s] message'%msgtype)
            return
        
        for listener in listeners:
            try:
                result = listener(data, session, msgtype, **options)
                
                if not result:
                    result = {}
                if listener.responsetype:
                    yield {'type': listener.responsetype, 'data': result, 'incoming': message}
                else:
                    logging.info('no response for [%s -> %s] service'%(msgtype, listener.func_name))
            except:
                traceback.print_exc()

ServiceBroker = InMemoryServiceBroker()



def Service(request, response):
    " decorator to expose a service that can be dispatched to by the Appcelerator message broker"
    def _(func):
        arity = func.func_code.co_argcount
        has_kwargs = func.func_code.co_flags & 8
                
        if arity == 0:
            def listener(data, session, msgtype, **options):
                if has_kwargs:
                    return func(data, **options)
                return func(data)
        elif arity == 1:
            def listener(data, session, msgtype, **options):
                if has_kwargs:
                    return func(data, **options)
                return func(data)
        elif arity == 2:
            def listener(data, session, msgtype, **options):
                if has_kwargs:
                    return func(data, session, **options)
                return func(data, session)
        elif arity == 3:
            def listener(data, session, msgtype, **options):
                if has_kwargs:
                    return func(data, session, msgtype, **options)
                return func(data, session, msgtype)
        else:
            logging.error('bad number of arguments for @Service annotated function, should be from 0 to 3')
            return
        
        listener.responsetype = response
        listener.func_name = func.func_name
        ServiceBroker.registerListener(request, listener)
        return listener
    return _





def _pylons_load_services():
    " if we are running with a pylons app, load files in 'services' directory"
    import os
    import os.path as p
        
    try:
        import pylons.config
        project_dir = pylons.config['pylons.paths']['root']
        if not project_dir:
            logging.info('Pylons is installed, but app is not inited, services will not be loaded')
            return
    except ImportError:
        logging.warn('Unable to import pylons.config, services will not be automatically loaded')
        return
    
    project_name = p.basename(project_dir)
    services_dir = p.join(project_dir,'services')
    services = [f[:-3] for f in os.listdir(services_dir) if f.endswith('.py')]
    
    for service in services:
        import_stmt = 'import %s.services.%s'%(project_name, service)
        logging.info(import_stmt)
        exec import_stmt in {}

def _appengine_load_services():
    " if we are running on appengine, load files in 'app/services' directory"
    import os
    import os.path as p
    services_dir = p.join(p.dirname(p.dirname(__file__)), 'app', 'services')
    
    if not p.exists(services_dir):
        logging.warning('Unable to locate service directory, services will not be automatically loaded')
        return
    
    services = [f[:-3] for f in os.listdir(services_dir) if f.endswith('.py')]
    
    for service in services:
        import_stmt = 'import app.services.'+service
        logging.info(import_stmt)
        exec import_stmt in {}
    


class DatastoreJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, db.Model):
            result = {}
            result['__id__'] = obj.key().id()
            result['__key__'] = str(obj.key())
            for name,value in obj._properties.iteritems():
                result[name] = getattr(obj, name)
                
            for name,value in vars(obj).iteritems():
                if not name.startswith('_'):
                    result[name] = getattr(obj, name)
                
            return result
        
        elif hasattr(obj, 'isoformat'):
            return obj.isoformat()
            
        elif isinstance(obj, users.User):   
            return {
                'nickname': obj.nickname(),
                'email': obj.email()
            }
    

def _json_decoder_hook(obj):
    if hasattr(obj, '__key__'):
        obj['__key__'] = db.Key(obj['__key__'])
    # it would be nice if datetimes came through too, but might be surprising
    return obj



# Is this IoC?
try:
    from google.appengine.ext import db
    from google.appengine.api import users
    import datetime
    # ok, we must be running on appengine, use our customizations
    _JsonEncoder = DatastoreJsonEncoder
    _decoder_hook = _json_decoder_hook
    _load_services = _appengine_load_services
    CrossDomainProxy = _appengine_CrossDomainProxy
except ImportError:
    # no appengine, using the standard stuff
    _JsonEncoder = json.JSONEncoder
    _decoder_hook = None
    _load_services = _pylons_load_services
    CrossDomainProxy = _default_CrossDomainProxy

