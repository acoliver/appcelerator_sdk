package org.appcelerator.service;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

import org.appcelerator.annotation.ExceptionResponse;
import org.appcelerator.messaging.Message;
import org.appcelerator.messaging.MessageUtils;

/**
 * The ExceptionResponseAdapter is created for each ExceptionResponse annotation.  It maps 
 * exceptions propogated from lower in the stack to an appcelerator message which is returned to 
 * the client along with any other messages.
 *
 * @author Andrew C. Oliver (acoliver@gmail.com)
 */
public class ExceptionResponseAdapter extends GenericInterceptorAdapter {
    private static final String SUCCESS = "success";
    private ExceptionResponse er;
    
    
    
    @SuppressWarnings("unchecked")
    public Object dispatch(Message request, Message response, List<Message> additionalResponses, Object returnValue)
            throws Exception {
        try {
            return this.getNext().dispatch(request, response, additionalResponses, returnValue);
        } catch (Exception e) {
            response.getData().put(SUCCESS, Boolean.FALSE.toString());
            //can i do instanceof here?
            if (!er.exception().isAssignableFrom(unwrap(e).getClass())) {
                throw e;
            } else { 
                Message message = new Message();
                message.setType(er.response());
                message.setData(MessageUtils.createMessageDataObject());
                message.getData().put(SUCCESS,Boolean.FALSE.toString());
                additionalResponses.add(message);
            }
        }
        return returnValue;
    }

    private Throwable unwrap(Throwable e) {
        Throwable x = e;
        if(x instanceof InvocationTargetException) {
            while(x instanceof InvocationTargetException  && ((InvocationTargetException)e).getCause() != null) {
                x = x.getCause();
            }
        }
        return x;
    }

    public ExceptionResponse getAnnotation() {
        return er;
    }



    public void setAnnotation(ExceptionResponse er) {
        this.er = er;
    }

}
