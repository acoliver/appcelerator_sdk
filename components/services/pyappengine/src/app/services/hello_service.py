
from appcelerator import Service
import logging

@Service(request='app.test.message.request', response='app.test.message.response')
def hello(params, session, msgtype):
    logging.info('got into the service handler')
    message = params.get('message', 'Cloud Computing')
    encoding = params.get('encoding', 'zip')
    try:
        # repr it so that we don't get output encoding errors ;)
        postmessage = repr(message.encode(encoding))
        original_size = len(message)
        final_size = len(postmessage)
        
        if original_size == 0:
            ratio = 'NaN'
        else:
            ratio = final_size/float(original_size)
        
        return {'message':'Your input has been encoded, see the log below',
                'original_message': message,
                'encoded_message': postmessage,
                'original_size': original_size,
                'final_size': final_size,
                'ratio':ratio,
                'success': 'true'}
    except:
        return {'success': 'false'}