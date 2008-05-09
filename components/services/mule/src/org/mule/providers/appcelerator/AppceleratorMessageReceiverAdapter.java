package org.mule.providers.appcelerator;

import org.appcelerator.dispatcher.ServiceAdapter;
import org.appcelerator.messaging.Message;

public class AppceleratorMessageReceiverAdapter extends ServiceAdapter {

    private AppceleratorMessageReceiver receiver;
    
    public AppceleratorMessageReceiverAdapter(String request, String response, String version, AppceleratorMessageReceiver receiver) {
        this.request = request;
        this.response = response;
        this.version = version;
        this.receiver = receiver;
    }

    @Override
    public void dispatch(Message request, Message response) {
        receiver.dispatch(request, response);
    }

    @Override
    public boolean is(ServiceAdapter sa) {
        // TODO Auto-generated method stub
        return false;
    }

}
