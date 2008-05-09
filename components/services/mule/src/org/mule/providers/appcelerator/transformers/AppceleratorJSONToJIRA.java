package org.mule.providers.appcelerator.transformers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import net.sf.json.JSONObject;

import org.mule.config.i18n.MessageFactory;
import org.mule.providers.jira.Constants;
import org.mule.providers.jira.beans.JiraMethodInvocation;
import org.mule.transformers.AbstractTransformer;
import org.mule.umo.transformer.TransformerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AppceleratorJSONToJIRA extends AbstractTransformer
{
    private static final Logger LOG = LoggerFactory.getLogger(AppceleratorJSONToJIRA.class);

    public AppceleratorJSONToJIRA()
    {
        this.registerSourceType(String.class);
        this.setReturnClass(AppceleratorJSONToJIRA.class);
    }
    
    @SuppressWarnings({"unchecked", "deprecation"})
    protected Object doTransform(Object src, String encoding) throws TransformerException
    {
        
        if (!(src instanceof String)) {
            LOG.warn("Given a data type that I cannot transform");
            throw new TransformerException(MessageFactory.createStaticMessage("This transformer can only handle payloads of type string"));
        }
        
        JSONObject o;
        try {
            o = JSONObject.fromObject(src);

        } catch (Exception e) {
            LOG.warn("Given a data type that I cannot transform");
            throw new TransformerException(MessageFactory.createStaticMessage("Payload must be a JSON object as a String"));
        }
 
        Map endpointProperties = new HashMap(this.getEndpoint().getProperties());
        String method = o.optString("method");
        if (method != null) {
            endpointProperties.put("method", method);
        }

        if (endpointProperties.get(Constants.ENDPOINT_JSON_PARAMS) == null)
            endpointProperties.put(Constants.ENDPOINT_JSON_PARAMS, new ArrayList());

        return JiraMethodInvocation.fromProperties(endpointProperties, src);

    }
}
