package org.appcelerator.service;

import java.lang.reflect.Method;
import java.util.List;

import org.appcelerator.annotation.ExceptionMethod;
import org.appcelerator.exception.InvalidInterceptorException;
import org.appcelerator.messaging.Message;
import org.appcelerator.util.Util;

public class ExceptionMethodAdapter extends GenericInterceptorAdapter{
    private static final short TYPE_INVALID = -1;
    private static final short TYPE_MESSAGES = 0;
    private static final short TYPE_BOUND = 1;
    private Method interceptorMethod;
    private ExceptionMethod annotation;
    private short type;
    private Object service; 
    
    @SuppressWarnings("unchecked")
    public ExceptionMethodAdapter(ExceptionMethod im) {
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

    @SuppressWarnings("unchecked")
    private short checkMethod(ExceptionMethod annotation) {
        Class intClass = annotation.interceptor();
        Class[] signature = annotation.signature();
        Method m = null;
        try {
            m = intClass.getDeclaredMethod(annotation.method(), annotation.signature());
        } catch (Exception e) {}
        if (m == null) {
            return TYPE_INVALID;
        }
        
        if (signature.length == 2 && signature[0].getName().equals(Method.class.getName())) {
            return TYPE_MESSAGES;
        }

        return TYPE_BOUND;
    }

    public Object dispatch(Message request, Message response, List<Message> additionalResponses, Object returnValue) throws Exception {
        
        switch(type) {
        case TYPE_INVALID: //can't happen unless constructed unusually 
            throw new InvalidInterceptorException(annotation, request);
        case TYPE_MESSAGES:
            try {
                return getNext().dispatch(request, response, additionalResponses, returnValue);
            } catch (Throwable t) {
                Throwable unwrapped = Util.unwrap(t);
                if(isApplicable(unwrapped)) {
                    return dispatchNominal(annotation, request,response, additionalResponses);
                } else {
                    if(unwrapped instanceof RuntimeException) {
                        throw ((RuntimeException)unwrapped);
                    } else {
                        throw new RuntimeException(unwrapped);
                    }
                }
            }
        case TYPE_BOUND:
        default:
            throw new InvalidInterceptorException("bound interceptors have not been implemented yet",annotation);
        }

    }
    
    private Object dispatchNominal(ExceptionMethod annotation, Message request, Message response, List<Message> additionalResponses) {
        try {
            return interceptorMethod.invoke(this.service, new Object[]{request,response});
        } catch (RuntimeException re) {
            throw re;
        } catch (Throwable e) {
            throw new RuntimeException(e);
        }
    }

    private boolean isApplicable(Throwable unwrapped) {
        Class[] exceptions = annotation.exceptions(); 
        for (Class exception : exceptions) {
            if(unwrapped.getClass().isAssignableFrom(exception)) {
                return true;
            }
        }
        return false;
    }

}
