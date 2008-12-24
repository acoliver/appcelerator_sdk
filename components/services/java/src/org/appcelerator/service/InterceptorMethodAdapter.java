package org.appcelerator.service;

import java.lang.reflect.Method;
import java.util.List;

import org.appcelerator.annotation.InterceptorMethod;
import org.appcelerator.exception.InvalidInterceptorException;
import org.appcelerator.messaging.Message;
import org.appcelerator.util.Util;

/**
 * This is used for generic interceptors.  For each InterceptorMethod annotation, one of these
 * is constructed and placed in the correct location by the StackConstructor.
 * 
 * @author Andrew C. Oliver (acoliver@gmail.com)
 */
public class InterceptorMethodAdapter extends GenericInterceptorAdapter {

    private static final short TYPE_INVALID = -1;
    private static final short TYPE_MESSAGES = 0;
    private static final short TYPE_BOUND = 1;
    private Method interceptorMethod;
    private InterceptorMethod annotation;
    private short type;
    private Object service;
    
    @SuppressWarnings("unchecked")
    public InterceptorMethodAdapter(InterceptorMethod im) {
        this.annotation = im;
        this.type = checkMethod(annotation);
        Class intClass = annotation.interceptor();
        if(this.type == TYPE_INVALID) {
            throw new InvalidInterceptorException(annotation);
        }
        try {
            service = intClass.newInstance();
            this.interceptorMethod = intClass.getDeclaredMethod(annotation.method(), annotation.signature());
        } catch (Exception e) {
            throw new InvalidInterceptorException(annotation,e);
        }
    }

    public Object dispatch(Message request, Message response, List<Message> additionalResponses, Object returnValue)
            throws Exception {
       
        switch(type) {
        case TYPE_INVALID: //can't happen unless constructed unusually 
            throw new InvalidInterceptorException(annotation, request);
        case TYPE_MESSAGES:
            Object retval =  dispatchNominal(annotation, request,response, additionalResponses);
            retval = retval != null ? retval: returnValue; // if we don't have a return value then supply the one from the parent
            return getNext() != null ? getNext().dispatch(request, response, additionalResponses, retval) : retval;
        case TYPE_BOUND:
        default:
            throw new InvalidInterceptorException("bound interceptors have not been implemented yet",annotation);
        }
    }

    private Object dispatchNominal(InterceptorMethod annotation, Message request, Message response, List<Message> additionalResponses) {
        try {
            return interceptorMethod.invoke(this.service, new Object[]{request,response});
        } catch (Throwable t) {
            response.getData().put("success", Boolean.FALSE.toString());
            Throwable u = Util.unwrap(t);
            if (u instanceof RuntimeException) {
                throw ((RuntimeException)u);
            } else {
                throw new RuntimeException(u);
            }
        } 
    }

    @SuppressWarnings("unchecked")
    private short checkMethod(InterceptorMethod annotation)  {
        Class intClass = annotation.interceptor();
        Class[] signature = annotation.signature();
        Method m = null;
        try {
            m = intClass.getDeclaredMethod(annotation.method(), annotation.signature());
        } catch (Exception e) {}
        if (m == null) {
            return TYPE_INVALID;
        }
        
        if (signature.length == 2 && signature[0].getName().equals(Message.class.getName())) {
            return TYPE_MESSAGES;
        }

        return TYPE_BOUND;
    }


}
