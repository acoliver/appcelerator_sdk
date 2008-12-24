package org.appcelerator.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.appcelerator.messaging.Message;

/**
 * InterceptorMethods are used in the BeforeMethods, AfterMethods and ExceptionMethods 
 * annotations.  These form stacks of interceptors.
 * @author Andrew C. Oliver (acoliver@gmail.com)
 * @see org.appcelerator.annotation.BeforeMethods
 * @see org.appcelerator.annotation.AfterMethods
 * @see org.appcelerator.annotation.ExceptionMethods
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface InterceptorMethod {
    /**
     * class in which the method to invoke is a member, one is constructed per InterceptorMethod instance
     * @return
     */
    Class interceptor();
    /**
     * method to invoke
     * @return
     */
    String method();
    /**
     * signature of the method to invoke.  i.e. an interceptor class could have 2 methods called
     * foo and only one takes Message request, Message response (the default).  The annotation
     * intends to support binding but it is not presently implemented (so leave this off for now).  
     * @return
     */
    Class[] signature() default {Message.class, Message.class};
}
