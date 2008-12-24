package org.appcelerator.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 1 or more of these are contained in the ExceptionResponses annotation.  This maps
 * a given exception (which it catches) to a given message (i.e. generic.error.response)
 * @author Andrew C. Oliver
 * @see org.appcelerator.annotation.ExceptionResponses
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionResponse {
    /**
     * Exception to map to a message
     * @return
     */
    Class exception() default Exception.class;
    /**
     * message to add to the messages returned to the client
     * @return
     */
    String response();
}
