/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
package org.appcelerator.util;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.xml.transform.ErrorListener;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.DOMReader;
import org.dom4j.io.DOMWriter;
import org.dom4j.io.DocumentResult;
import org.dom4j.io.DocumentSource;
import org.dom4j.io.SAXReader;
import org.xml.sax.EntityResolver;

/**
 * DOM4JUtil is a collections of utilities for dealing with DOM4j.
 *
 * @author <a href="mailto:jkashimba@hakano.com">Jared Kashimba</a>
 */
public class DOM4JUtil
{
    private static final Logger LOG = Logger.getLogger(DOM4JUtil.class);
    private static final TransformerFactory TRANSFORMER_FACTORY = TransformerFactory.newInstance();

    /**
     * convert a W3C DOM Document to a dom4j Document
     *
     * @param doc W3C DOM Document to convert
     * @return dom4j Document
     */
    public static Document convert(org.w3c.dom.Document doc)
    {
        DOMReader reader = new DOMReader();
        return reader.read(doc);
    }

    /**
     * convert a DOM4j dom to W3C dom
     *
     * @param doc DOM4j document
     * @return W3C DOM document
     * @throws DocumentException upon conversion error
     */
    public static org.w3c.dom.Document convert(Document doc) throws DocumentException
    {
        DOMWriter writer = new DOMWriter();
        return writer.write(doc);
    }

    /**
     * removes specified child node types from the specified element recursively
     *
     * @param element   element to start removal search with
     * @param nodeTypes node types to remove
     * @return number of nodes to remove
     */
    public static int removeChildNodeTypes(final Element element, final short... nodeTypes)
    {
        int removedNodes = 0;

        Set<Short> removeNodeTypes = new HashSet<Short>();

        for (short nodeType : nodeTypes)
        {
            removeNodeTypes.add(nodeType);
        }

        for (Iterator nodeIter = element.nodeIterator(); nodeIter.hasNext();)
        {
            Node node = (Node) nodeIter.next();

            if (removeNodeTypes.contains(node.getNodeType()))
            {
                element.remove(node);
                ++removedNodes;
            }
        }

        return removedNodes;
    }

    /**
     * performs a select single node by specified element name, attribute name, and attribute value.
     *
     * @param element        element to perform select single node from
     * @param elementName    name of element for xpath
     * @param attributeName  attribute name for xpath
     * @param attributeValue attribute value for xpath
     * @return single node selected (as element) or <code>null</code> if not found
     */
    public static Element getElementByAttributeValue(final Element element, final String elementName, final String attributeName, final String attributeValue)
    {
        StringBuilder xPathBuilder = new StringBuilder(elementName);
        xPathBuilder.append("[@");
        xPathBuilder.append(attributeName);
        xPathBuilder.append("='");
        xPathBuilder.append(attributeValue);
        xPathBuilder.append("']");

        return (Element) element.selectSingleNode(xPathBuilder.toString());
    }

    /**
     * selects a single node from the specified xpath and returns the text of the element
     *
     * @param document document to execute against
     * @param xPath    xpath query to execute
     * @return text as string or <code>null</code> if not found
     */
    public static String selectSingleNodeGetText(final Document document, final String xPath)
    {
        Node node = document.selectSingleNode(xPath);

        if (null == node)
        {
            return null;
        }

        if (!(node instanceof Element))
        {
            return null;
        }

        Element element = (Element) node;
        return getText(element);
    }

    /**
     * executes xpath to select single node based on element name and attribute name.
     *
     * @param element       element to execute search from
     * @param elementName   element name
     * @param attributeName attribute name element must contain
     * @return found element or <code>null</code> if not found
     */
    public static Element getElementByAttribute(final Element element, final String elementName, final String attributeName)
    {
        StringBuilder xPathBuilder = new StringBuilder(elementName);
        xPathBuilder.append("[@");
        xPathBuilder.append(attributeName);
        xPathBuilder.append("]");

        return (Element) element.selectSingleNode(xPathBuilder.toString());
    }

    /**
     * executes a select nodes xpath for elements with specified name, containing attributes of specified name with specified value.
     *
     * @param element        element to execute select nodes from
     * @param elementName    name of element for xpath
     * @param attributeName  name of attribute for element to contain
     * @param attributeValue value of named attribute
     * @return list of elements meeting criteria
     */
    public static List getElementsByAttributeValue(final Element element, final String elementName, final String attributeName, final String attributeValue)
    {
        StringBuilder xPathBuilder = new StringBuilder(elementName);
        xPathBuilder.append("[@");
        xPathBuilder.append(attributeName);
        xPathBuilder.append("='");
        xPathBuilder.append(attributeValue);
        xPathBuilder.append("']");

        return element.selectNodes(xPathBuilder.toString());
    }

    /**
     * executes a select nodes xpath for elements with specified name, containing attributes of specified name.
     *
     * @param element       element to execute select nodes from
     * @param elementName   name of element for xpath
     * @param attributeName name of attribute for element to contain
     * @return list of elements meeting criteria
     */
    public static List getElementsByAttribute(final Element element, final String elementName, final String attributeName)
    {
        StringBuilder xPathBuilder = new StringBuilder(elementName);
        xPathBuilder.append("[@");
        xPathBuilder.append(attributeName);
        xPathBuilder.append("]");

        return element.selectNodes(xPathBuilder.toString());
    }

    /**
     * creates a DOM4J document from the specified string of XML.
     *
     * @param xml string of xml
     * @return DOM4J document parsed from string xml
     */
    public static Document createDocumentFromString(String xml)
    {
        try
        {
            return DocumentHelper.parseText(xml);
        }
        catch (DocumentException documentException)
        {
            LOG.warn("unable to parse document from xml string = " + xml, documentException);
        }

        return null;
    }

    /**
     * fetches the url location specified in the string and returns the content in a DOM4J document.
     *
     * @param urlString url in string format to fetch and parse
     * @return contents of URL in DOM4J document
     */
    public static Document fetchDocument(String urlString)
    {
        URL url;
        try
        {
            url = new URL(urlString);
        }
        catch (MalformedURLException malformedURLException)
        {
            LOG.warn("unable to fetch document, invalid location " + urlString, malformedURLException);
            return null;
        }

        return fetchDocument(url);
    }

    /**
     * fetches the url location specified and returns the content in a DOM4J document.
     *
     * @param url url to fetch and parse
     * @return contents of URL in DOM4J document
     */
    public static Document fetchDocument(URL url)
    {
        URLConnection urlConnection;
        try
        {
            urlConnection = url.openConnection();
        }
        catch (IOException ioException)
        {
            LOG.warn("unable to fetch document, could not open connection to " + url, ioException);
            return null;
        }

        InputStream inputStream;
        try
        {
            inputStream = urlConnection.getInputStream();
        }
        catch (IOException ioException)
        {
            LOG.warn("unable to fetch document, could not get input stream from " + url, ioException);
            return null;
        }

        return parseDocument(inputStream);
    }

    /**
     * parses the document from the input stream into a DOM4j document
     *
     * @param inputStream input stream to parse
     * @return DOM4j parsed document
     */
    public static Document parseDocument(InputStream inputStream)
    {
        return parseDocument(inputStream, null);
    }

    /**
     * parses the document from the input stream using the specified entity resolver into a DOM4j document
     *
     * @param inputStream input stream to parse
     * @param resolver    entity resolver
     * @return DOM4j parsed document
     */
    public static Document parseDocument(InputStream inputStream, EntityResolver resolver)
    {
        try
        {
            SAXReader reader = new SAXReader();
            reader.setValidation(false);
            if (resolver != null)
            {
                reader.setEntityResolver(resolver);
            }
            return reader.read(inputStream);
        }
        catch (DocumentException documentException)
        {
            LOG.warn("unable to parse document, could not read/parse from " + inputStream, documentException);
            return null;
        }
    }

    /**
     * parses the document from the file using the specified entity resolver into a DOM4j document
     *
     * @param file     file to parse
     * @param resolver entity resolver
     * @return DOM4j parsed document
     */
    public static Document parseDocument(File file, EntityResolver resolver)
    {
        InputStream in = null;
        try
        {
            in = new FileInputStream(file);
            return parseDocument(in, resolver);
        }
        catch (FileNotFoundException fileNotFoundException)
        {
            LOG.warn("unable to parse document, could not read from " + file, fileNotFoundException);
            return null;
        }
        finally
        {
            if (in != null)
            {
                IOUtils.closeQuietly(in);
            }
        }
    }

    /**
     * parses the document from the file into a DOM4j document
     *
     * @param file file to parse
     * @return DOM4j parsed document
     */
    public static Document parseDocument(File file)
    {
        return parseDocument(file, null);
    }

    /**
     * parses the document from the string into a DOM4j document
     *
     * @param string string to parse
     * @return DOM4j parsed document
     */
    public static Document parseDocument(String string)
    {
        return parseDocument(string, null);
    }

    /**
     * parses the document from the string using the specified entity resolver into a DOM4j document
     *
     * @param string   string to parse
     * @param resolver entity resolver
     * @return DOM4j parsed document
     */
    public static Document parseDocument(String string, EntityResolver resolver)
    {
        return parseDocument(new ByteArrayInputStream(string.getBytes()), resolver);
    }

    /**
     * return the text content of the Element
     *
     * @param element element to get text content of
     * @return text content
     */
    public static String getText(Element element)
    {
        Iterator iter = element.nodeIterator();
        StringBuilder builder = new StringBuilder();
        while (iter.hasNext())
        {
            Node node = (Node) iter.next();
            if (node.getNodeType() == Node.CDATA_SECTION_NODE || node.getNodeType() == Node.TEXT_NODE)
            {
                builder.append(node.getText());
            }
            else if (node.getNodeType() == Node.ELEMENT_NODE)
            {
                builder.append(node.asXML());
            }
        }
        return builder.toString();
    }

    /**
     * transforms document with the specified stylesheet
     *
     * @param document   document to transform
     * @param stylesheet stylesheet to apply
     * @return transformed document or <code>null</code> upon error
     */
    public static Document transformDocument(Document document, Document stylesheet)
    {
        return transformDocument(document, stylesheet, null);
    }

    /**
     * transforms document with the specified stylesheet and transformer parameters
     *
     * @param document   document to transform
     * @param stylesheet stylesheet to apply
     * @param parameters transformer parameters
     * @return transformed document or <code>null</code> upon error
     */
    public static Document transformDocument(Document document, Document stylesheet, Map<String, Object> parameters)
    {
        Transformer transformer;
        try
        {
            transformer = TRANSFORMER_FACTORY.newTransformer(new DocumentSource(stylesheet));
        }
        catch (TransformerConfigurationException transformerConfigurationException)
        {
            LOG.warn("unable to transform document, problem instantiating new transformer", transformerConfigurationException);
            return null;
        }

        try
        {
            DocumentResult documentResult = new DocumentResult();
            if (parameters != null)
            {
                for (String key : parameters.keySet())
                {
                    Object value = parameters.get(key);
                    transformer.setParameter(key, value);
                }
            }
            transformer.setErrorListener(new ErrorListener()
            {
                public void error(TransformerException arg0) throws TransformerException
                {
                    LOG.error(arg0.getMessageAndLocation(), arg0);
                }

                public void fatalError(TransformerException arg0) throws TransformerException
                {
                    LOG.fatal(arg0.getMessageAndLocation(), arg0);
                }

                public void warning(TransformerException arg0) throws TransformerException
                {
                    LOG.warn(arg0.getMessageAndLocation(), arg0);
                }
            });
            transformer.transform(new DocumentSource(document), documentResult);
            return documentResult.getDocument();
        }
        catch (TransformerException transformerException)
        {
            LOG.warn("unable to transform document, problem transforming", transformerException);
            return null;
        }
    }
}
