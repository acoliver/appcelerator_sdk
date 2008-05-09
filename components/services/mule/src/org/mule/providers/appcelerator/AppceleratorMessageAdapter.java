package org.mule.providers.appcelerator;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.appcelerator.messaging.JSONMessageDataObject;
import org.appcelerator.messaging.Message;
import org.mule.impl.ThreadSafeAccess;
import org.mule.providers.AbstractMessageAdapter;
import org.mule.umo.MessagingException;
import org.mule.umo.provider.MessageTypeNotSupportedException;


public class AppceleratorMessageAdapter extends AbstractMessageAdapter
{

    private static final long serialVersionUID = -4241963892227389413L;

    private Message request;
    private Message response;
    
    private String jsonPayload;
    
    public AppceleratorMessageAdapter(Object message) throws MessagingException
    {
        super();

        if (message instanceof Object[] || ((Object[]) message).length < 2)
        {
            Object[] rr = (Object[]) message;
            this.request = (Message) rr[0];
            this.response = (Message) rr[1];
        }
        else
        {
            throw new MessageTypeNotSupportedException(message, this.getClass());
        }
        
        try {
            JSONObject jobject = ((JSONMessageDataObject) request.getData()).getJSONObject();
            jsonPayload = jobject.optString("payload");

            if (jsonPayload == null)
                jsonPayload = "";
            
        } catch (JSONException e) {
            jsonPayload = "";
        }
    }

    protected AppceleratorMessageAdapter(AppceleratorMessageAdapter template)
    {
        super(template);
        this.request = template.request;
        this.response = template.response;
    }

    public Object getPayload()
    {
        return jsonPayload;
    }

    public byte[] getPayloadAsBytes() throws Exception
    {
        return jsonPayload.getBytes();
    }

    /**
     * Converts the message implementation into a String representation
     * 
     * @param encoding The encoding to use when transforming the message (if
     *            necessary). The parameter is used when converting from a byte array
     * @return String representation of the message payload
     * @throws Exception Implementation may throw an endpoint specific exception
     */
    public String getPayloadAsString(String encoding) throws Exception
    {
        return jsonPayload;
    }

    public String getUniqueId()
    {
        return request.getType() + response.getType() + request.getVersion();
    }

    public ThreadSafeAccess newThreadCopy()
    {
        return new AppceleratorMessageAdapter(this);
    }

}
