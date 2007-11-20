
from appcelerator.core import Service


@Service(request='example.createcontact.request', response='example.createcontact.response')
def hello(msg):
    return {'id': 1001, 'success': 'true'}

