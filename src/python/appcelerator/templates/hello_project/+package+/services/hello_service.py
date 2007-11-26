
from appcelerator.core import Service


@Service(request='app.test.message.request', response='app.test.message.response')
def hello(msg):
    message = msg.get('message', 'World')
    return {'message': 'I received from you: %s'%message, 'success': 'true'}
