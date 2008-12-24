package org.appcelerator.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * contains a set of InterceptorMethod annotations which list what class/method to call after 
 * the actual service method is invoked
 * @author Andrew C. Oliver
 * @see org.appcelerator.annotation.InterceptorMethod
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface AfterMethods {
    InterceptorMethod[] value();
}
