package org.appcelerator.service;

import java.util.List;

import org.appcelerator.messaging.Message;
import org.appcelerator.util.Util;

public class DefaultExceptionAdapter extends GenericInterceptorAdapter {

    public Object dispatch(Message request, Message response, List<Message> additionalResponses, Object returnValue)
            throws Exception {
        try {
            return getNext().dispatch(request, response, additionalResponses, returnValue);
        } catch (Throwable t) {
            Throwable u = Util.unwrap(t);
            response.getData().put("exception", u.getMessage());
        }
        return null;
    }

}
