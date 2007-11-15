
/**
 * DOM utils
 */
Appcelerator.Util.Dom =
{
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12,

	/**
	 * iterator for node attributes
	 * pass in an iterator function and optional specified (was explicit
	 * placed on node or only inherited via #implied)
	 */
    eachAttribute: function (node, iterator, excludes, specified)
    {
        specified = specified == null ? true : specified;
        excludes = excludes || [];

        if (node.attributes)
        {
            var map = node.attributes;
            for (var c = 0,len = map.length; c < len; c++)
            {
                var item = map[c];
                if (item && item.value != null && specified == item.specified)
                {
                    var type = typeof(item);
                    if (item.value.startsWith('function()'))
                    {
                       continue;
                    }
                    if (type == 'function' || type == 'native' || item.name.match(/_moz\-/) ) continue;
                	if (excludes.length > 0)
                	{
                	  	  var cont = false;
                	  	  for (var i=0,l=excludes.length;i<l;i++)
                	  	  {
                	  	  	  if (excludes[i]==item.name)
                	  	  	  {
                	  	  	  	  cont = true;
                	  	  	  	  break;
                	  	  	  }
                	  	  }
                	  	  if (cont) continue;
                	}
                    iterator(item.name, item.value, item.specified, c, map.length);
                }
            }
            return c > 0;
        }
        return false;
    },

    getTagAttribute: function (element, tagname, key, def)
    {
        try
        {
            var attribute = element.getElementsByTagName(tagname)[0].getAttribute(key);
            if (null != attribute)
            {
                return attribute;
            }
        }
        catch (e)
        {
            //squash...
        }

        return def;
    },

    each: function(nodelist, nodeType, func)
    {
        if (typeof(nodelist) == "array")
        {
            nodelist.each(function(n)
            {
                if (n.nodeType == nodeType)
                {
                    func(n);
                }
            });
        }
        //Safari returns "function" as the NodeList object from a DOM
        else if (typeof(nodelist) == "object" || typeof(nodelist) == "function" && navigator.userAgent.match(/WebKit/i))
        {
            for (var p = 0, len = nodelist.length; p < len; p++)
            {
                var obj = nodelist[p];
                if (typeof obj.nodeType != "undefined" && obj.nodeType == nodeType)
                {
                    try
                    {
                        func(obj);
                    }
                    catch(e)
                    {
                        if (e == $break)
                        {
                            break;
                        }
                        else if (e != $continue)
                        {
                            throw e;
                        }
                    }
                }
            }
        }
        else
        {
            throw ("unsupported dom nodelist type: " + typeof(nodelist));
        }
    },

	/**
 	 * return the text value of a node as XML
 	 */
    getText: function (n,skipHTMLStyles,visitor,addbreaks,skipcomments)
    {
		var text = [];
        var children = n.childNodes;
        var len = children ? children.length : 0;
        for (var c = 0; c < len; c++)
        {
            var child = children[c];
            if (visitor)
            {
            	child = visitor(child);
            }
            if (child.nodeType == this.COMMENT_NODE)
            {
            	if (!skipcomments)
            	{
                	text.push("<!-- " + child.nodeValue + " -->");
            	}
                continue;
            }
            if (child.nodeType == this.ELEMENT_NODE)
            {
                text.push(this.toXML(child, true, null, null, skipHTMLStyles, addbreaks,skipcomments));
            }
            else
            {
                if (child.nodeType == this.TEXT_NODE)
                {
                	var v = child.nodeValue;
                	if (v)
                	{
                    	text.push(v);
                    	if (addbreaks) text.push("\n");
                	}
                }
                else if (child.nodeValue == null)
                {
                    text.push(this.toXML(child, true, null, null, skipHTMLStyles, addbreaks,skipcomments));
                }
                else
                {
                    text.push(child.nodeValue || '');
                }
            }
        }
        return text.join('');
    },

/**
 * IE doesn't have an hasAttribute when you dynamically
 * create an element it appears
 */
    hasAttribute: function (e, n, cs)
    {
        if (!e.hasAttribute)
        {
            if (e.attributes)
            {
                for (var c = 0, len = e.attributes.length; c < len; c++)
                {
                    var item = e.attributes[c];
                    if (item && item.specified)
                    {
                        if (cs && item.name == n || !cs && item.name.toLowerCase() == n.toLowerCase())
                        {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        else
        {
            return e.hasAttribute(n);
        }
    },

    getAttribute: function (e, n, cs)
    {
        if (cs)
        {
            return e.getAttribute(n);
        }
        else
        {
            for (var c = 0, len = e.attributes.length; c < len; c++)
            {
                var item = e.attributes[c];
                if (item && item.specified)
                {
                    if (item.name.toLowerCase() == n.toLowerCase())
                    {
                        return item.value;
                    }
                }
            }
            return null;
        }
    },

	/**
	 * given an XML element node, return a string representing
	 * the XML
	 */
    toXML: function(e, embed, nodeName, id, skipHTMLStyles, addbreaks, skipcomments)
    {
    	nodeName = (nodeName || e.nodeName.toLowerCase());
        var xml = [];

		xml.push("<" + nodeName);
        
        if (id)
        {
            xml.push(" id='" + id + "' ");
        }
        if (e.attributes)
        {
	        var x = 0;
            var map = e.attributes;
            for (var c = 0, len = map.length; c < len; c++)
            {
                var item = map[c];
                if (item && item.value != null && item.specified)
                {
                    var type = typeof(item);
                    if (item.value && item.value.startsWith('function()'))
                    {
                       continue;
                    }
                    if (type == 'function' || type == 'native' || item.name.match(/_moz\-/)) continue;
                    if (id != null && item.name == 'id')
                    {
                        continue;
                    }
                    
                    // special handling for IE styles
                    if (Appcelerator.Browser.isIE && !skipHTMLStyles && item.name == 'style' && e.style && e.style.cssText)
                    {
                       var str = e.style.cssText;
                       xml.push(" style=\"" + str+"\"");
                       x++;
                       continue;
                    }
                    
                    var attr = String.escapeXML(item.value);
                    xml.push(" " + item.name + "=\"" + attr + "\"");
                    x++;
                }
            }
        }
        xml.push(">");

        if (embed && e.childNodes && e.childNodes.length > 0)
        {
        	xml.push("\n");
            xml.push(this.getText(e,skipHTMLStyles,null,addbreaks,skipcomments));
        }
		xml.push("</" + nodeName + ">" + (addbreaks?"\n":""));
		
        return xml.join('');
    },

    getAndRemoveAttribute: function (node, name)
    {
        var value = node.getAttribute(name);
        if (value)
        {
            node.removeAttribute(name);
        }
        return value;
    },

    getAttributesString: function (element, excludes)
    {
        var html = '';
        this.eachAttribute(element, function(name, value)
        {
            if (!excludes || !excludes.exists(name))
            {
                html += name + '="' + String.escapeXML(value||'') + '" ';
            }
        }, null, true);
        return html;
    },
	createElement: function (type, options)
	{
	    var elem = document.createElement(type);
	    if (options)
	    {
	        if (options['parent'])
	        {
	            options['parent'].appendChild(elem);
	        }
	        if (options['className'])
	        {
	            elem.className = options['className'];
	        }
	        if (options['html'])
	        {
	            elem.innerHTML = options['html'];
	        }
	        if (options['children'])
	        {
	            options['children'].each(function(child)
	            {
	                elem.appendChild(child);
	            });
	        }
	    }
	    return elem;
	}
};

try
{
    if (typeof(DOMNodeList) == "object") DOMNodeList.prototype.length = DOMNodeList.prototype.getLength;
    if (typeof(DOMNode) == "object")
    {
        DOMNode.prototype.childNodes = DOMNode.prototype.getChildNodes;
        DOMNode.prototype.parentNode = DOMNode.prototype.getParentNode;
        DOMNode.prototype.nodeType = DOMNode.prototype.getNodeType;
        DOMNode.prototype.nodeName = DOMNode.prototype.getNodeName;
        DOMNode.prototype.nodeValue = DOMNode.prototype.getNodeValue;
    }
}
catch(e)
{
}
