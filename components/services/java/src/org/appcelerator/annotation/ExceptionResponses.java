package org.appcelerator.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Contains 1 or more ExceptionResponse annotations.  Each map an exception to a message.
 * @author Andrew C. Oliver
 * @see org.appcelerator.annotation.ExceptionResponse
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionResponses {
    ExceptionResponse[] value();
}
