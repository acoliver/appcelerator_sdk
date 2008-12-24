package org.appcelerator.service;


/**
 * This base class implements the get next and set next contract of InterceptorAdapter.
 * There is no need to use it except for the convienience of not having to implement the 
 * getter and setter. 
 * 
 *  @author Andrew C. Oliver (acoliver@gmail.com)
 */
public abstract class GenericInterceptorAdapter implements InterceptorAdapter {
    
    private InterceptorAdapter next;

    public InterceptorAdapter getNext() {
       
        return this.next;
    }

    public void setNext(InterceptorAdapter interceptor) {
        this.next = interceptor;
        
    }

}
