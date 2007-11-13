
from appcelerator.core import Service


@Service(request='hello.request', response='hello.response')
def hello(msg):
    name = msg.get('name', 'World')
    return {'greeting': 'Hello %s!'%name}
