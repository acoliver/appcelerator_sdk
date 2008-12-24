package org.appcelerator.exception;

import org.appcelerator.annotation.ExceptionMethod;
import org.appcelerator.annotation.InterceptorMethod;
import org.appcelerator.messaging.Message;

/**
 * typed runtime exception for various types of programming/usage errors involving interceptors
 * @author Andrew C. Oliver (acoliver@gmail.com)
 *
 */
public class InvalidInterceptorException extends RuntimeException {
    private static final long serialVersionUID = 6518233609739782281L;
    
    public InvalidInterceptorException(InterceptorMethod annotation, Message request) {
        super("Invalid interceptor for message: "+ request+ " with method: "+annotation.method());
    }

    public InvalidInterceptorException(InterceptorMethod annotation) {
        super("Invalid interceptor class: "+ annotation.interceptor() +" with method: "+annotation.method());
    }

    public InvalidInterceptorException(InterceptorMethod annotation, Exception e) {
        super("Invalid interceptor class: "+ annotation.interceptor() +" with method: "+annotation.method() +" due to exception "+e.toString(),e);
    }

    public InvalidInterceptorException(String message, InterceptorMethod annotation) {
        super("Invalid interceptor reason: "+message+" class: "+ annotation.interceptor() +" with method: "+annotation.method());
    }

    public InvalidInterceptorException(ExceptionMethod annotation, Exception e) {
        super("Invalid interceptor class: "+ annotation.interceptor() +" with method: "+annotation.method() +" due to exception "+e.toString(),e);
    }

    public InvalidInterceptorException(ExceptionMethod annotation) {
        super("Invalid interceptor class: "+ annotation.interceptor() +" with method: "+annotation.method());
    }

    public InvalidInterceptorException(ExceptionMethod annotation, Message request) {
        super("Invalid interceptor for message: "+ request+ " with method: "+annotation.method());
    }

    public InvalidInterceptorException(String message, ExceptionMethod annotation) {
        super("Invalid interceptor reason: "+message+" class: "+ annotation.interceptor() +" with method: "+annotation.method());
    }
}
