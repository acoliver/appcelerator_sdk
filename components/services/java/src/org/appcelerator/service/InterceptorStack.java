package org.appcelerator.service;

import java.util.List;

import org.appcelerator.messaging.Message;

/**
 * The InterceptorStack hooks into the MethodCallServiceAdapter.  Because the ServiceAdapter
 * do not allow interruption of the call stack flow, this is called PRIOR to the MethodCallSerivceAdapter
 * which is in turn PART of the stack and is not called directly but as an interceptor in the stack.
 * 
 * @author Andrew C. Oliver (acoliver@gmail.com)
 *
 */
public class InterceptorStack {
    InterceptorAdapter first;
    InterceptorAdapter last;
    
    public InterceptorStack() {
      
    }
    
    public void add(InterceptorAdapter interceptor) {
        first = first == null ? interceptor : first;
        if (last != null) {
            last.setNext(interceptor);
        }
        last = interceptor;
    }
    

    
    @SuppressWarnings("finally")
    public Object dispatch(Message request, Message response, List<Message> additionalResponses) {
        Object retval = null;
        try {
        retval= first.dispatch(request, response, additionalResponses, null);
        } catch (Throwable e) {
            response.getData().put("success", Boolean.FALSE.toString());
            if(e instanceof RuntimeException) {
                throw ((RuntimeException)e);
            } else {
                throw new RuntimeException(e);
            }
        }
        return retval;
    }
}
