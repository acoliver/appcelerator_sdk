package org.mule.providers.appcelerator.transformers;

import java.io.UnsupportedEncodingException;

import net.sf.json.JSONException;
import net.sf.json.JSONObject;

import org.mule.transformers.AbstractTransformer;
import org.mule.umo.transformer.TransformerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class XMLToJSON extends AbstractTransformer
{
    private static final Logger LOGGER = LoggerFactory.getLogger(XMLToJSON.class);

    public XMLToJSON()
    {
        this.registerSourceType(String.class);
        this.registerSourceType(Object.class);
        this.setReturnClass(String.class);
    }

    protected Object doTransform(Object src, String encoding) throws TransformerException
    {

        if (src == null || !(src instanceof String))
            return encode("", encoding);

        try {
            JSONObject o = XML.toJSONObject((String) src);
            return encode(o.toString(), encoding);

        } catch (JSONException e) {
            return encode("", encoding);
        }

    }
    
    private String encode(String str, String encoding) {

        if (encoding == null)
            encoding = "UTF-8";

        try
        {
            return new String(str.getBytes(encoding));
        }
        catch (UnsupportedEncodingException uee)
        {
            LOGGER.warn("Unsupported encoding specified '" + encoding
                        + "', could not handle and thus returning original string");
        }

        return str;

    }




}
