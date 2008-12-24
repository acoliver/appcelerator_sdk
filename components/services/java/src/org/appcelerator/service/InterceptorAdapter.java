package org.appcelerator.service;

import java.util.List;

import org.appcelerator.messaging.Message;

/**
 * This is the quintesential interceptor adapted for appcelerator's message framework.
 * These form 3 stacks: exception, before, after.  The exception stack is run first and 
 * consists entirely of ExceptionResponseAdapter which catch their mapped errors and turn
 * them into messages.  The before stack is run before the actual method call.  The after
 * stack is run after the method call.  Any exceptions are propegated up the stack unless
 * caught in the ExceptionResponseAdapter in which case they are swallowed and turned into
 * messages.  Any exception causes success=false to be added to the response.
 * 
 *  Interceptors may add additional responses to "additionalResponses" which are returned to the 
 *  client.  These responses are created in the same way as the mapped "response" object.
 * 
 * @see org.appcelerator.annotation.BeforeMethods
 * @see org.appcelerator.annotation.AfterMethods
 * @see org.appcelerator.annotation.InterceptorMethod
 * @see org.appcelerator.annotation.ExceptionResponses
 * @see org.appcelerator.annotation.ExceptionResponse
 * @author acoliver@gmail.com
 */
public interface InterceptorAdapter {
    /**
     * Interceptors are responsible for calling the next interceptor in the chain, the
     * StackConstructor sets them up this way.
     * @param interceptor that is next in the chain
     */
    void setNext(InterceptorAdapter interceptor);
    /**
     * Interceptors are responsible for calling the next interceptor in the chain, the 
     * dispatch method calls this to get the next interceptor in the chain
     * @return next interceptor in the chain
     */
    InterceptorAdapter getNext();
    /**
     * This is the primary invocation method for interceptors
     * @param request mapped request object that will be sent to the method or mapped
     * @param response mapped response object that will be sent to the method or mapped
     * @param additionalResponses other response messages that are added by interceptors
     * @param returnValue a previous interceptor can suggest a default return value in the event the service method does not set one
     * @return returnValue from the actual service method or one of the interceptors
     * @throws Exception
     */
    Object dispatch(Message request, Message response, List<Message> additionalResponses, Object returnValue) throws Exception;
}
