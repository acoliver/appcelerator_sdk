package org.appcelerator.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.appcelerator.messaging.Message;

/**
 * ExceptionMethod specifies a special type of "InterceptorMethod" that is only called when certain types of exceptions are
 * triggered
 * @author Andrew C. Oliver (acoliver@gmail.com)
 *
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionMethod {
    /**
     * type of Exception to catch, default is actually Throwable.class.  If you only want 
     * the method to be called for SPECIFIC types of exceptions then include them here
     * @return
     */
    Class[] exceptions() default {Throwable.class};
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
