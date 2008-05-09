package org.mule.providers.appcelerator.transformers;

import java.io.UnsupportedEncodingException;

import net.sf.json.JSON;
import net.sf.json.JSONException;
import net.sf.json.JSONSerializer;

import org.mule.transformers.AbstractTransformer;
import org.mule.umo.transformer.TransformerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JSONToXML extends AbstractTransformer
{
    private static final Logger LOGGER = LoggerFactory.getLogger(JSONToXML.class);

    public JSONToXML()
    {
        this.registerSourceType(String.class);
        this.registerSourceType(Object.class);
        this.setReturnClass(String.class);
    }

    protected Object doTransform(Object src, String encoding) throws TransformerException
    {

        try {

            if (src == null || !(src instanceof String))
                return encode(XML.toString(""), encoding);

            JSON toConvert = JSONSerializer.toJSON(src);
            String xml = XML.toString(toConvert);
            
            return encode(xml, encoding);

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
