from appcelerator.core import Service


@Service(request='example.createcontact.request', response='example.createcontact.response')
def hello(params, session, msgtype):
    assert msgtype == 'example.createcontact.request'
    return {'id': 1001, 'success': 'true'}