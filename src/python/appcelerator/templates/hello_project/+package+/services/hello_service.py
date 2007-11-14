
from appcelerator.core import Service


@Service(request='app.test.message.request', response='app.test.message.response')
def hello(msg):
    message = msg.get('message', 'World')
    return {'message': 'I recieved from you: %s'%message}
