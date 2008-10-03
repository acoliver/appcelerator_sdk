/**
 * Traverses the document, starting at the body node.
 *
 * As it encounters widget tags, it fires off async requests for
 * the modules' code. As modules finish fetching they callback
 * listeners which call Appcelerator.Compiler.compileWidget
 * to construct the widget in HTML.
 *
 * A.C.compileWidget dispatches widget construction to each module,
 * and then uses flags (called 'instructions') returned by the module
 * to complete the widget building/compiling process.
 *
 * @fileOverview a set of functions related to compiling a DOM with web expressions into resulting DHTML/javascript/AJAX
 * @name Appcelerator.Compiler
 */

/**
 * this should be set if you want the document to be
 * compiled when loaded - otherwise, it must be manually compiled
 */
Appcelerator.Compiler.compileOnLoad = true;

/**
 * returns true if running in interpretive mode
 * compilation is done at runtime in the browser
 *
 * @deprecated no longer used
 */
Appcelerator.Compiler.isInterpretiveMode = true;

/**
 * returns true if running in compiled mode
 * compilation is done at deployment time
 *
 * @deprecated no longer used
 */
Appcelerator.Compiler.isCompiledMode = false;


Appcelerator.Compiler.POSITION_REMOVE = -1;
Appcelerator.Compiler.POSITION_REPLACE = 0;
Appcelerator.Compiler.POSITION_TOP = 1;
Appcelerator.Compiler.POSITION_BOTTOM = 2;
Appcelerator.Compiler.POSITION_BEFORE = 3;
Appcelerator.Compiler.POSITION_AFTER = 4;
Appcelerator.Compiler.POSITION_BODY_TOP = 5;
Appcelerator.Compiler.POSITION_BODY_BOTTOM = 6;
Appcelerator.Compiler.POSITION_HEAD_TOP = 7;
Appcelerator.Compiler.POSITION_HEAD_BOTTOM = 8;

Appcelerator.Compiler.nextId = 0;
Appcelerator.Compiler.functionId = 1;

/**
 * check an element for an ID and ensure that if it doesn't have one,
 * it will automatically generate a system-generated unique ID
 *
 * @param {element} element element to check
 * @return {string} return the id of the element
 */
Appcelerator.Compiler.getAndEnsureId = function(element)
{
	if (!element.id)
	{
		element.id = Appcelerator.Compiler.generateId();
	}
	if (!element._added_to_cache)
	{
	    Appcelerator.Compiler.setElementId(element,element.id);
    }
	return element.id;
};

/**
 * set an elements ID attribute. an variable in the global scope
 * will be created that references the element object in the format
 * $ID such as if you have an element named foo you can reference the
 * element directly with the global variable named $foo.
 *
 * @param {element} element to set ID
 * @param {string} id of the element
 * @return {element} element
 */
Appcelerator.Compiler.setElementId = function(element, id)
{
	Appcelerator.Compiler.removeElementId(element.id);
    element.id = id;
    element._added_to_cache = true;
    // set a global variable to a reference to the element
    // which now allows you to do something like $myid in javascript
    // to reference the element
    window['$'+id]=element;
    return element;
};

/**
 * removes an element ID attribute from the global cache and
 * delete the auto-generated global variable
 *
 * @param {string} id id of the element to delete
 * @return {boolean} true if found or false if not found
 */
Appcelerator.Compiler.removeElementId = function(id)
{
	if (id)
	{
		var element_var = window['$'+id];
		if (element_var)
		{
			try
			{
				delete window['$'+id];
			}
			catch(e)
			{
				window['$'+id] = 0;
			}
			if (element_var._added_to_cache)
			{
				try
				{
				    delete element_var._added_to_cache;
				}
				catch (e)
				{
					element_var._added_to_cache = 0;
				}
			}
			return true;
		}
	}
	return false;
};

/**
 * we're doing to redefine prototype's $ function to do some special
 * processing - we delete it first
 *
 * @private
 */
(function()
{
	if (Object.isFunction(window['$']))
	{
	    try
	    {
	        delete window['$'];
	    }
	    catch (e)
	    {
	    }
	}
})();


/**
 * redefined $ function from prototype which is optimized to lookup
 * the element first by checking the global variable for the element
 *
 * @param {string} element can either by array of string ids, single strip or element
 * @return {element} element object or null if not found
 */
function $(element)
{
	if (arguments.length > 1)
	{
	    var args = $A(arguments);
    	return args.collect(function(a)
		{
			return $(a);
		});
 	}

	if (Object.isString(element))
	{
	    if(element == '')
	    {
	        // otherwise $('') == $, which breaks code doing null testing
	        return null;
	    }
		var id = element;
		element = window['$'+id];
		if (!element)
		{
			element = document.getElementById(id);
		}
	}

	return element ? Element.extend(element) : null;
}

/**
 * generate a unique ID
 *
 * @return {string} id that can be used only once
 */
Appcelerator.Compiler.generateId = function()
{
	return 'app_' + (Appcelerator.Compiler.nextId++);
};

/**
 * @property {hash} has of key which is name of element (or * for all elements) and array
 * of attribute processors that should be called when element is encountered
 */
Appcelerator.Compiler.attributeProcessors = {'*':[]};

/**
 * Register an object that has a <b>handle</b> method which takes
 * an element, attribute name, and attribute value of the processed element.
 *
 * This method takes the name of the element (or optionally, null or * as
 * a wildcard) and an attribute (required) value to look for on the element
 * and a listener.
 *
 * @param {string} name of attribute processor. can be array of strings for multiple elements or * for wildcard.
 * @param {string} attribute to check when matching element
 * @param {function} listener to call when attribute is matched on element
 */
Appcelerator.Compiler.registerAttributeProcessor = function(name,attribute,listener)
{
	if (typeof name == 'string')
	{
		name = name||'*';
		var a = Appcelerator.Compiler.attributeProcessors[name];
		if (!a)
		{
			a = [];
			Appcelerator.Compiler.attributeProcessors[name]=a;
		}
		// always push to the end such that custom attribute processors will be 
		// processed before internal ones so that they can overwrite builtins
		a.unshift([attribute,listener]);
	}
	else
	{
		for (var c=0,len=name.length;c<len;c++)
		{
			var n = name[c]||'*';
			var a = Appcelerator.Compiler.attributeProcessors[n];
			if (!a)
			{
				a = [];
				Appcelerator.Compiler.attributeProcessors[n]=a;
			}
			// always push to the end such that custom attribute processors will be 
			// processed before internal ones so that they can overwrite builtins
			a.unshift([attribute,listener]);
		}
	}
};

/**
 * called internally by compiler to dispatch details to attribute processors
 *
 * @param {element} element
 * @param {array} array of processors
 */
Appcelerator.Compiler.forwardToAttributeListener = function(element,array)
{
    for (var i=0;i<array.length;i++)
	{
		var entry = array[i];
		var attributeName = entry[0];
		var listener = entry[1];
		var value = element.getAttribute(attributeName);
        if (value) // optimization to avoid adding listeners if the attribute isn't present
        {
            listener.handle(element,attributeName,value);
        }
    }
};

/**
 * internal method called to process each element and potentially one or
 * more attribute processors
 *
 * @param {element} element
 */
Appcelerator.Compiler.delegateToAttributeListeners = function(element)
{
	var tagname = Appcelerator.Compiler.getTagname(element);
	var p = Appcelerator.Compiler.attributeProcessors[tagname];
	if (p && p.length > 0)
	{
		Appcelerator.Compiler.forwardToAttributeListener(element,p,tagname);
	}
	p = Appcelerator.Compiler.attributeProcessors['*'];
	if (p && p.length > 0)
	{
		Appcelerator.Compiler.forwardToAttributeListener(element,p,'*');
	}
};

Appcelerator.Compiler.containerProcessors=[];

/**
 * add a listener that is fired when a container is created
 *
 * @param {function} listener which is a container processor
 */
Appcelerator.Compiler.addContainerProcessor = function(listener)
{
	Appcelerator.Compiler.containerProcessors.push(listener);
};

/**
 * remove container listener
 *
 * @param {function} listener to remove
 */
Appcelerator.Compiler.removeContainerProcessor = function(listener)
{
	Appcelerator.Compiler.containerProcessors.remove(listener);
};

/**
 * called when a container is created
 *
 * @param {element} element being compiled
 * @param {element} container
 */
Appcelerator.Compiler.delegateToContainerProcessors = function(element,container)
{
	if (Appcelerator.Compiler.containerProcessors.length > 0)
	{
		for (var c=0,len=Appcelerator.Compiler.containerProcessors.length;c<len;c++)
		{
			var processor = Appcelerator.Compiler.containerProcessors[c];
			var r = processor.process(element,container);
			if (r)
			{
				container = r;
			}
		}
	}
	return container;
};

/**
 * List of attributes to copy from the original <app:widget_name> element
 * onto the <div> that replaces that widget.
 *
 * Needed for the 'bind' action and 'selectable' attribute.
 */
Appcelerator.Compiler.retainedWidgetAttributes = ['name'];
Appcelerator.Compiler.addContainerProcessor(
{
	process: function(element,container)
	{
	    var attrs = Appcelerator.Compiler.retainedWidgetAttributes;
	    for(var i = 0; i < attrs.length; i++)
	    {
	        var attr = attrs[i];
    		var v = element.getAttribute(attr);
    		if (v)
    		{
    			container.setAttribute(attr,v);
    		}
    	}
	}
});


Appcelerator.Compiler.checkLoadState = function (element)
{
	var state = element.state;
	if (state && state.pending==0 && state.scanned)
	{
		if (typeof(state.onfinish)=='function')
		{
			state.onfinish(code);
		}

		if (typeof(state.onafterfinish)=='function')
		{
			state.onafterfinish();
		}
		Appcelerator.Compiler.removeState(element);
		return true;
	}
	return false;
};

/**
 * call this to dynamically compile a widget on-the-fly and evaluate
 * any widget JS code as compiled
 *
 * @param {element} element to compile
 * @param {boolean} notimeout immediately process or false (default) to process later
 * @param {boolean} recursive compile child elements
 */
Appcelerator.Compiler.dynamicCompile = function(element,notimeout,recursive)
{
	if (!element) return;

    $D('dynamic compile called for ',element,' - id=',element.id);

    Appcelerator.Compiler.doCompile(element,recursive);
};

Appcelerator.Compiler.doCompile = function(element,recursive)
{
    var state = Appcelerator.Compiler.createCompilerState();
    Appcelerator.Compiler.compileElement(element,state,recursive);
    state.scanned = true;
    Appcelerator.Compiler.checkLoadState(element);
};

Appcelerator.Compiler.removeState = function(element)
{
	if (element.state)
	{
		try 
		{
			delete element.state;
		}
		catch (e)
		{
			element.state = null;
		}
	}
};

Appcelerator.Compiler.createCompilerState = function ()
{
	return {pending:0,scanned:false};
};

Appcelerator.Compiler.onbeforecompileListeners = [];
Appcelerator.Compiler.oncompileListeners = [];
Appcelerator.Compiler.beforeDocumentCompile = function(l)
{
	Appcelerator.Compiler.onbeforecompileListeners.push(l);
};
Appcelerator.Compiler.afterDocumentCompile = function(l)
{
    Appcelerator.Compiler.oncompileListeners.push(l);
};

/**
 * main entry point for compiler to compile document DOM
 *
 * @param {function} onFinishCompiled function to call (or null) when document is finished compiling
 */
Appcelerator.Compiler.compileDocument = function(onFinishCompiled)
{
    $D('compiled document called');

    if (Appcelerator.Compiler.onbeforecompileListeners)
    {
       for (var c=0;c<Appcelerator.Compiler.onbeforecompileListeners.length;c++)
       {
           Appcelerator.Compiler.onbeforecompileListeners[c]();
       }
       delete Appcelerator.Compiler.onbeforecompileListeners;
    }

    var container = document.body;
    var originalVisibility = container.style.visibility || 'visible';

	if (Appcelerator.Config['hide_body'])
	{
	    container.style.visibility = 'hidden';
	}

    if (!document.body.id)
    {
        Appcelerator.Compiler.setElementId(document.body, 'app_body');
    }

    var state = Appcelerator.Compiler.createCompilerState();
	container.state = state;
	
    // start scanning at the body
    Appcelerator.Compiler.compileElement(container,state);

    // mark it as complete and check the loading state
    state.scanned = true;
    state.onafterfinish = function(code)
    {
        (function()
        {
		    if (typeof(onFinishCompiled)=='function') onFinishCompiled();
		    if (originalVisibility!=container.style.visibility)
		    {
		       container.style.visibility = originalVisibility;
		    }
			Appcelerator.Compiler.compileDocumentOnFinish();
        }).defer();
    };
    Appcelerator.Compiler.checkLoadState(container);
};

Appcelerator.Compiler.compileDocumentOnFinish = function ()
{
    if (Appcelerator.Compiler.oncompileListeners)
    {
        for (var c=0;c<Appcelerator.Compiler.oncompileListeners.length;c++)
        {
            Appcelerator.Compiler.oncompileListeners[c]();
        }
        delete Appcelerator.Compiler.oncompileListeners;
    }
    $MQ('l:app.compiled');
}

Appcelerator.Compiler.compileInterceptors=[];

Appcelerator.Compiler.addCompilationInterceptor = function(interceptor)
{
	Appcelerator.Compiler.compileInterceptors.push(interceptor);
};

Appcelerator.Compiler.onPrecompile = function (element)
{
	if (Appcelerator.Compiler.compileInterceptors.length > 0)
	{
		for (var c=0,len=Appcelerator.Compiler.compileInterceptors.length;c<len;c++)
		{
			var interceptor = Appcelerator.Compiler.compileInterceptors[c];
			if (interceptor.onPrecompile(element)==false)
			{
				return false;
			}
		}
	}
	return true;
};

Appcelerator.Compiler.compileElement = function(element,state,recursive)
{
    recursive = recursive==null ? true : recursive;

	Appcelerator.Compiler.getAndEnsureId(element);
	Appcelerator.Compiler.determineScope(element);

    $D('compiling element => '+element.id);

	if (typeof(state)=='undefined')
	{
		throw "compileElement called without state for "+element.id;
	}

	Appcelerator.Compiler.onPrecompile(element);

	// check to see if we should compile
	var doCompile = element.getAttribute('compile') || 'true';
	if (doCompile == 'false')
	{
		return;
	}

    if (Appcelerator.Compiler.isInterpretiveMode)
    {
        if (element.compiled)
        {
           Appcelerator.Compiler.destroy(element);
        }
        element.compiled = 1;
    }

	//TODO: fix this - we need to remove this from element
	
	element.state = state;

	try
	{
		var name = Appcelerator.Compiler.getTagname(element);
		var kind = element.getAttribute('kind');  //FIXME: deprecate this
		if (name.indexOf(':')>0)
		{
			element.style.originalDisplay = element.style.display || 'block';

	        state.pending+=1;
			Appcelerator.Core.requireModule(name,function()
			{
				Appcelerator.Compiler.compileWidget(element,state);
				state.pending-=1;
				Appcelerator.Compiler.checkLoadState(element);
				Element.fire(element,'element:compiled:'+element.id,{id:element.id});
			});
		}
		else if(kind && kind.length > 0)
		{
			var name = 'app:'+kind;
			state.pending += 1;
			Appcelerator.Core.requireModule(name,function()
			{
				var widgetJS = Appcelerator.Compiler.compileWidget(element,state,name);
				state.pending -= 1;
				Appcelerator.Compiler.checkLoadState(state);
				Element.fire(element,'element:compiled:'+element.id,{id:element.id});
			});
		}
		else
		{
			Appcelerator.Compiler.delegateToAttributeListeners(element);

			if (recursive && !element.stopCompile)
	        {
				Appcelerator.Compiler.compileElementChildren(element);
				Element.fire(element,'element:compiled:'+element.id,{id:element.id});
			}
		}
	}
	catch(e)
	{
		Appcelerator.Compiler.handleElementException(element, e, 'compiling ' + element.id);
	}
};

Appcelerator.Compiler.compileElementChildren = function(element)
{
	if (element && element.nodeType == 1)
	{
		if (element.nodeName.toLowerCase() != 'textarea')
		{
			var elementChildren = Appcelerator.Compiler.getElementChildren(element);
			for (var i=0,len=elementChildren.length;i<len;i++)
			{
	            Appcelerator.Compiler.compileElement(elementChildren[i],element.state);
			}
		}
		Appcelerator.Compiler.checkLoadState(element);
		Element.fire(element,'element:compiled:'+element.id,{id:element.id});
	}
};

Appcelerator.Compiler.getElementChildren = function (element)
{
    var elementChildren = [];
	if (element && element.nodeType == 1)
	{
		for (var i = 0, length = element.childNodes.length; i < length; i++)
		{
		    if (element.childNodes[i].nodeType == 1)
		    {
	    	     elementChildren.push(element.childNodes[i]);
	    	}
		}
	}
	return elementChildren;
}

/**
 * method should be called to clean up any listeners or internally added stuff
 * the compiler places into the element
 *
 * @param {element} element to destroy
 * @param {boolean} recursive should be destroy element's children as well (defaults to true)
 */
Appcelerator.Compiler.destroy = function(element, recursive)
{
	if (!element) return;
	recursive = recursive==null ? true : recursive;

	element.compiled = 0;

	Appcelerator.Compiler.removeElementId(element.id);

	if (Object.isArray(element.trashcan))
	{
		for (var c=0,len=element.trashcan.length;c<len;c++)
		{
			try
			{
				element.trashcan[c]();
			}
			catch(e)
			{
				$D(e);
			}
		}
		try
		{
			delete element.trashcan;
		}
		catch(e)
		{
			$D(e);
		}
	}

	if (recursive)
	{
		if (element.nodeType == 1 && element.childNodes && element.childNodes.length > 0)
		{
			for (var c=0,len=element.childNodes.length;c<len;c++)
			{
				var node = element.childNodes[c];
				if (node && node.nodeType && node.nodeType == 1)
				{
					try
					{
						Appcelerator.Compiler.destroy(node,true);
					}
					catch(e)
					{
					    $E(e);
					}
				}
			}
		}
	}
};

Appcelerator.Compiler.destroyContent = function(element)
{
	var elementChildren = Appcelerator.Compiler.getElementChildren(element);
	for (var i=0,len=elementChildren.length;i<len;i++)
	{
	    Appcelerator.Compiler.destroy(elementChildren[i], true);
	}
};

Appcelerator.Compiler.addTrash = function(element,trash)
{
	if (!element.trashcan)
	{
		element.trashcan = [];
	}
	element.trashcan.push(trash);
};

Appcelerator.Compiler.getJsonTemplateVar = function(namespace,var_expr,template_var)
{
    var def = {};
    var o = Object.getNestedProperty(namespace,var_expr,def);

    if (o == def) // wasn't found in template context
    {
        try
        {
            with(namespace) { o = eval(var_expr) };
        }
        catch (e) // couldn't be evaluated either
        {
            return template_var; // maybe a nested template replacement will catch it
        }
    }
    
    if (typeof(o) == 'object')
    {
        o = Object.toJSON(o).replace(/"/g,'&quot;');
    }
    return o;
}

Appcelerator.Compiler.templateRE = /#\{(.*?)\}/g;
Appcelerator.Compiler.compileTemplate = function(html,htmlonly,varname)
{
	varname = varname==null ? 'f' : varname;

	var fn = function(m, name, format, args)
	{
		return "', jtv(values,'"+name+"','#{"+name+"}'),'";
	};
	var body = "var "+varname+" = function(values){ var jtv = Appcelerator.Compiler.getJsonTemplateVar; return ['" +
            html.replace(/(\r\n|\n)/g, '').replace(/\t/g,' ').replace(/'/g, "\\'").replace(Appcelerator.Compiler.templateRE, fn) +
            "'].join('');};" + (htmlonly?'':varname);

	var result = htmlonly ? body : eval(body);

	return result;
};

Appcelerator.Compiler.tagNamespaces = [];
for (var x=0;x<document.documentElement.attributes.length;x++)
{
    var attr = document.documentElement.attributes[x];
    var name = attr.name;
    var value = attr.value;
    var idx = name.indexOf(':');
    if (idx > 0)
    {
        Appcelerator.Compiler.tagNamespaces.push(name.substring(idx+1));
    }
}

if (Appcelerator.Compiler.tagNamespaces.length == 0)
{
	Appcelerator.Compiler.tagNamespaces.push('app');
}

Appcelerator.Compiler.removeHtmlPrefix = function(html)
{
    if (Appcelerator.Browser.isIE)
    {
        html = html.gsub(/<\?xml:namespace(.*?)\/>/i,'');
    }
    return html.gsub(/html:/i,'').gsub(/><\/img>/i,'/>');
};

/**
 * this super inefficient but nifty function will
 * parse our HTML: namespace tags required when HTML is
 * included in APP: tags but as long as they are
 * not within a APP: tags content.  The browser
 * doesn't like HTML: (he'll think it's a non-HTML tag)
 * so we need to strip the HTML: before passing to browser
 * as long as it's outside a appcelerator widget
 *
 * @param {string} html string to parse
 * @param {prefix} prefix to remove
 * @return {string} content with prefixes properly removed
 */
Appcelerator.Compiler.specialMagicParseHtml = function(html,prefix)
{
    var newhtml = html;
    for (var c=0;c<Appcelerator.Compiler.tagNamespaces.length;c++)
    {
        newhtml = Appcelerator.Compiler.specialMagicParseTagSet(newhtml,Appcelerator.Compiler.tagNamespaces[c]);
    }
    return newhtml;
};
Appcelerator.Compiler.specialMagicParseTagSet = function(html,prefix)
{
    var beginTag = '<'+prefix+':';
    var endTag = '</'+prefix+':';

    var idx = html.indexOf(beginTag);
    if (idx < 0)
    {
        return Appcelerator.Compiler.removeHtmlPrefix(html);
    }

    var myhtml = Appcelerator.Compiler.removeHtmlPrefix(html.substring(0,idx));

    var startIdx = idx + beginTag.length;

    var tagEnd = html.indexOf('>',startIdx);

    var tagSpace = html.indexOf(' ',startIdx);
    if (tagSpace<0 || tagEnd<tagSpace)
    {
        tagSpace=tagEnd;
    }
    var tagName = html.substring(startIdx,tagSpace);
    var endTagName = endTag+tagName+'>';

    while ( true )
    {
        var lastIdx = html.indexOf(endTagName,startIdx);
        var endTagIdx = html.indexOf('>',startIdx);
        var lastTagIdx = html.indexOf('>',lastIdx);
        var content = html.substring(endTagIdx+1,lastIdx);
        // check to see if we're within a nested element of the same name
        var dupidx = content.indexOf(beginTag+tagName);
        if (dupidx!=-1)
        {
            startIdx=lastIdx+endTagName.length;
            continue;
        }
        var specialHtml = html.substring(idx,lastIdx+endTagName.length);
        if (Appcelerator.Browser.isIE)
        {
            specialHtml = Appcelerator.Compiler.removeHtmlPrefix(specialHtml);
        }
        myhtml+=specialHtml;
        break;
    }

    myhtml+=Appcelerator.Compiler.specialMagicParseHtml(html.substring(lastTagIdx+1),prefix);
    return myhtml;
};

Appcelerator.Compiler.copyAttributes = function (sourceElement, targetElement)
{
	Appcelerator.Util.Dom.eachAttribute(sourceElement,function(name,value,specified,idx,len)
	{
		if (specified) targetElement.setAttribute(name,value);
	},['style','class','id']);
};

Appcelerator.Compiler.getHtml = function (element,convertHtmlPrefix)
{
	convertHtmlPrefix = (convertHtmlPrefix==null) ? true : convertHtmlPrefix;

	var html = element.innerHTML || Appcelerator.Util.Dom.getText(element);

	return Appcelerator.Compiler.convertHtml(html, convertHtmlPrefix);
};

Appcelerator.Compiler.addIENameSpace = function (html)
{
	if (Appcelerator.Browser.isIE)
	{
		html = '<?xml:namespace prefix = app ns = "http://www.appcelerator.org" /> ' + html;
	}
	return html;
};


Appcelerator.Compiler.convertHtml = function (html, convertHtmlPrefix)
{
	// convert funky url-encoded parameters escaped
	if (html.indexOf('#%7B')!=-1)
	{
	   html = html.gsub('#%7B','#{').gsub('%7D','}');
    }

	// IE/Opera unescape XML in innerHTML, need to escape it back
	html = html.gsub(/\\\"/,'&quot;');

	if (convertHtmlPrefix)
	{
		return (html!=null) ? Appcelerator.Compiler.specialMagicParseHtml(html) : '';
	}
	else
	{
		return html;
	}
};

Appcelerator.Compiler.getWidgetHTML = function(element,stripHTMLPrefix)
{
	//TODO: remove this method in favor of the mapped method
	return Appcelerator.Compiler.getHtml(element,stripHTMLPrefix);
};

Appcelerator.Compiler.isHTMLTag = function(element)
{
	if (Appcelerator.Browser.isIE)
	{
		return element.scopeName=='HTML' || !element.tagUrn;
	}
	var tagName = Appcelerator.Compiler.getTagName(element,true);
	return !tagName.startsWith('app:');
};

Appcelerator.Compiler.getTagname = function(element)
{
	if (!element) throw "element cannot be null";
	if (element.nodeType!=1) throw "node: "+element.nodeName+" is not an element, was nodeType: "+element.nodeType+", type="+(typeof element);

	// used by the compiler to mask a tag
	if (element._tagName) return element._tagName;

	if (Appcelerator.Browser.isIE)
	{
		if (element.scopeName && element.tagUrn)
		{
			return element.scopeName + ':' + element.nodeName.toLowerCase();
		}
	}
	if (Appcelerator.Compiler.isInterpretiveMode)
	{
		return element.nodeName.toLowerCase();
	}
	return String(element.nodeName.toLowerCase());
};

/**
 * internal method to add event listener
 *
 * @param {element} element to add event to
 * @param {string} event name
 * @param {function} action to invoke when event is fired
 * @param {integer} amount of time to delay before calling action after event fires
 * @return {element} returns element for chaining
 */
Appcelerator.Compiler.addEventListener = function (element,event,action,delay)
{
	var logWrapper = function()
	{
		var args = $A(arguments);
		$D('on '+element.id+'.'+event+' => invoking action '+action);
		return action.apply({data:{}},args);
	};

	var functionWrapper = delay > 0 ? (function()
	{
		var args = $A(arguments);

		// IE destroys the keyCode when there's a delay
		var event = args[0];
		if (event.keyCode)
		{
		    args[0] = {keyCode: event.keyCode};
		}

		var a = function()
		{
			return logWrapper.apply(logWrapper,args);
		};
        a.delay(delay/1000);
	}) : logWrapper;

	Event.observe(element,event,functionWrapper,false);

	Appcelerator.Compiler.addTrash(element,function()
	{
		Event.stopObserving(element,event,functionWrapper);
	});

	return element;
}

/**
 * called to install a change listener
 *
 * @param {element} element to add change listener
 * @param {function} action function to call when change is detected in element
 * @return {element} element
 */
Appcelerator.Compiler.installChangeListener = function (element, action)
{
    (function()
    {
        if(element.type == 'checkbox')
	    {
	        // Safari is finicky
	        element._validatorObserver = new Form.Element.Observer(
	            element, 0.1, action
	        );
	    }
	    else
	    {
	        element._focusChangeListener = function()
    	    {
    	        element._validatorObserver = new Form.Element.Observer(element,.5,function(element, value)
                {
    	            action(element,value);
    	        });
    	    };
    	    Event.observe(element,'focus',element._focusChangeListener);

	        element._blurChangeListener = function()
    	    {
    	        if (element._validatorObserver)
    	        {
    	            element._validatorObserver.stop();
    	            try { delete element._validatorObserver; } catch (e) { element._validatorObserver = null; }
                    action(element,Field.getValue(element));
    	        }
    	    };
    	    Event.observe(element,'blur',element._blurChangeListener);
    	}
    }).defer();

    return element;
};

Appcelerator.Compiler.removeChangeListener = function (element)
{
    (function()
    {
        if (element._focusChangeListener)
        {
            Event.stopObserving(element, 'focus', element._focusChangeListener);
            try { delete element._focusChangeListener; } catch (e) { element._focusChangeListener = null; }
        }
        if (element._blurChangeListener)
        {
            Event.stopObserving(element, 'blur', element._blurChangeListener);
            try { delete element._blurChangeListener; } catch (e) { element._blurChangeListener = null; }
        }
        if (element._validatorObserver)
        {
            element._validatorObserver.stop();
            try { delete element._validatorObserver; } catch (e) { element._validatorObserver = null; }
        }
    }).defer();
}

Appcelerator.Compiler.ElementFunctions = {};

/**
 * get a function attached to element
 *
 * @param {element} element that has attached function
 * @param {string} name of function
 * @return {function} function attached or null if none found with name
 */
Appcelerator.Compiler.getFunction = function(element,name)
{
	var id = (typeof element == 'string') ? element : element.id;
	var key = id + '_' + name;

	var f = Appcelerator.Compiler.ElementFunctions[key];
	if (f)
	{
		return f;
	}

	element = $(id);
	if (element)
	{
		return element[name];
	}
	return null;
};

/**
 * attach a special function to element which can be invoked (such as a special action)
 * by system
 *
 * @param {element} element to attach function to
 * @param {string} name of the function
 * @param {function} function to invoke
 * @return {element} element
 */
Appcelerator.Compiler.attachFunction = function(element,name,f)
{
	var id = (typeof element == 'string') ? element : element.id;
	var key = id + '_' + name;
	Appcelerator.Compiler.ElementFunctions[key]=f;
	return element;
};

/**
 * attempt to first execute a special attached function by name or if not found
 * attempt to execute a function already part of elements prototype
 *
 * @param {element} element to invoke against
 * @param {string} name of the function
 * @param {array} arguments to pass
 * @param {boolean} required to be there or if not - throw exception
 * @return {object} value returned from invocation
 */
Appcelerator.Compiler.executeFunction = function(element,name,args,required)
{
	required = (required==null) ? false : required;
	args = (args==null) ? [] : args;
	var id = (typeof element == 'string') ? element : element.id;
	element = $(id);

	var key = id + '_' + name;
	var f = Appcelerator.Compiler.ElementFunctions[key];
	if (f)
	{
        //
        // NOTE: you must call the function as below since
        // natively wrapped methods like focus won't work if you
        // try and use the normal javascript prototype call/apply
        // methods on them
        //
		switch(args.length)
		{
			case 0:
				return f();
			case 1:
				return f(args[0]);
			case 2:
				return f(args[0],args[1]);
			case 3:
				return f(args[0],args[1],args[2]);
			case 4:
				return f(args[0],args[1],args[2],args[3]);
			case 5:
				return f(args[0],args[1],args[2],args[3],args[4]);
			case 6:
				return f(args[0],args[1],args[2],args[3],args[4],args[5]);
			case 7:
				return f(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
			case 8:
				return f(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
			case 9:
				return f(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8]);
			case 10:
				return f(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],args[9]);
			case 11:
				return f(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8],args[9],args[10]);
			default:
				throw "too many arguments - only 11 supported currently for method: "+name+", you invoked with "+args.length+", args was: "+Object.toJSON(args);
		}
	}
	if (element)
	{
		var f = element[name];
		var tf = typeof(f);
		if (f && (tf == 'function' || (Appcelerator.Browser.isIE && tf == 'object')))
		{
			return element[name]();
		}
	}
	else if (required)
	{
		throw "element with ID: "+id+" doesn't have a function named: "+name;
	}
};




/**
 * called by compiler to compile a widget
 *
 * @param {element} element object to compile which must be a widget
 * @param {object} state object
 * @param {name} name of the widget which can override what the element actually is
 * @return {string} compiled code or null if none generated
 */
Appcelerator.Compiler.customConditionObservers = {};

Appcelerator.Compiler.compileWidget = function(element,state,name)
{
	name = name || Appcelerator.Compiler.getTagname(element);
	var module = Appcelerator.Core.widgets[name];
	var compiledCode = '';
	
    $D('compiled widget '+element+', id='+element.id+', tag='+name+', module='+module);

	if (module)
	{
		if (Appcelerator.Compiler.isInterpretiveMode && module.flashRequired)
		{
			var version = module.flashVersion || 9.0;
			var error = null;

			if (!Appcelerator.Browser.isFlash)
			{
				error = 'Flash version ' + version + ' or greater is required';
			}
			else if (Appcelerator.Browser.flashVersion < version)
			{
				error = 'Flash version ' + version + ' or greater is required. Your version is: '+Appcelerator.Browser.flashVersion;
			}

			if (error)
			{
				error = error + '. <a href="http://www.adobe.com/products/flashplayer/" target="_NEW">Download Flash Now</a>'
				var html = '<div class="flash_error" style="border:1px solid #c00;padding:5px;background-color:#fcc;text-align:center;margin:5px;">' + error + '</div>';
				new Insertion.Before(element,html);
				Element.remove(element);
				return;
			}
		}

		var id = Appcelerator.Compiler.getAndEnsureId(element);

		var moduleAttributes = module.getAttributes();
		var widgetParameters = {};
		for (var i = 0; i < moduleAttributes.length; i++)
		{
			var error = false;
			(function(){
				var modAttr = moduleAttributes[i];
				var value = element.getAttribute(modAttr.name) || modAttr.defaultValue;
				// check and make sure the value isn't a function as what will happen in certain
				// situations because of prototype's fun feature of attaching crap on to the Object prototype
				if (Object.isFunction(value))
				{
					value = modAttr.defaultValue;
				}
				if (!value && !modAttr.optional)
				{
					Appcelerator.Compiler.handleElementException(element, null, 'required attribute "' + modAttr.name + '" not defined for ' + id);
					error = true;
				}
				widgetParameters[modAttr.name] = value;
			})();
			if (error)
			{
				return;
			}
		}
		widgetParameters['id'] = id;

		//
		// building custom functions
		//
		var functions = null;
		if (module.getActions)
		{
			functions = module.getActions();
			for (var c=0;c<functions.length;c++)
			{
				Appcelerator.Compiler.buildCustomAction(functions[c]);
			}
		}

        // grab any custom conditions before attempting to parse on attributes
        if(module.getConditions)
        {
            Appcelerator.Compiler.customConditionObservers[id] = {};
            var customConditions = module.getConditions();
            for (var i = 0; i < customConditions.length; i++)
            {
                var custCond = customConditions[i];
                var condFunct = Appcelerator.Compiler.customConditionFunctionCallback(custCond);
                Appcelerator.Compiler.registerCustomCondition({conditionNames: [custCond]}, 
                    condFunct, element.id);
            }
        }

        //
        // parse on attribute
        //
        if (Object.isFunction(module.dontParseOnAttributes))
        {
            if (!module.dontParseOnAttributes())
            {
                Appcelerator.Compiler.parseOnAttribute(element);
            }
        }
        else
        {
            Appcelerator.Compiler.parseOnAttribute(element);
        }
        
		//
		// hand off widget for building
		//
		var instructions = null;
		try
		{
			instructions = module.buildWidget(element,widgetParameters,state);
		}
		catch (exxx)
		{
			Appcelerator.Compiler.handleElementException(element, exxx, 'building widget ' + element.id);
			return;
		}

		//
		// allow the widget to change its id
		//
		if (element.id != id)
		{
			Appcelerator.Compiler.removeElementId(id);
			id = element.id;
			Appcelerator.Compiler.getAndEnsureId(element);
		}

		var added = false;
		if (instructions)
		{
			var position = instructions.position || Appcelerator.Compiler.POSITION_REPLACE;
			var removeElement = position == Appcelerator.Compiler.POSITION_REMOVE;

			if (!removeElement)
			{
				//
				// now handle presentation details
				//
				var html = instructions.presentation;
				if (html!=null)
				{
					// rename the real ID
					Appcelerator.Compiler.setElementId(element, id+'_widget');
					// widgets can define the tag in which they should be wrapped
					if(instructions.parent_tag != 'none' && instructions.parent_tag != '')
					{
					   var parent_tag = instructions.parent_tag || 'div';
					   html = '<'+parent_tag+' id="'+id+'_temp" style="margin:0;padding:0;display:none">'+html+'</'+parent_tag+'>';
					}

					// add the XML namespace IE thing but only if you have what looks to
					// be a widget that requires namespace - otherwise, it will causes issues like when
					// you include a single <img>
					if (Appcelerator.Browser.isIE && html.indexOf('<app:') != -1)
					{
						html = Appcelerator.Compiler.addIENameSpace(html);
					}

					added = true;
					switch(position)
					{
						case Appcelerator.Compiler.POSITION_REPLACE:
						{
							new Insertion.Before(element,html);
							removeElement = true;
							break;
						}
						case Appcelerator.Compiler.POSITION_TOP:
						{
							new Insertion.Top(element,html);
							break;
						}
						case Appcelerator.Compiler.POSITION_BOTTOM:
						{
							new Insertion.Bottom(element,html);
							break;
						}
						case Appcelerator.Compiler.POSITION_BEFORE:
						{
							new Insertion.Before(element,html);
							break;
						}
						case Appcelerator.Compiler.POSITION_AFTER:
						{
							new Insertion.After(element,html);
							break;
						}
						case Appcelerator.Compiler.POSITION_BODY_TOP:
						{
							new Insertion.Top(document.body,html);
							break;
						}
						case Appcelerator.Compiler.POSITION_BODY_BOTTOM:
						{
							new Insertion.Bottom(document.body,html);
							break;
						}
						case Appcelerator.Compiler.POSITION_HEAD_TOP:
						{
							new Insertion.Top(Appcelerator.Core.HeadElement,html);
							break;
						}
						case Appcelerator.Compiler.POSITION_HEAD_BOTTOM:
						{
							new Insertion.Bottom(Appcelerator.Core.HeadElement,html);
							break;
						}
					}
				}
			}

			var outer = null;
			if (added)
			{
				outer = $(id+'_temp');
				if (!outer)
				{
					// in case we're in a content file or regular unattached DOM
					outer = element.ownerDocument.getElementById(id+'_temp');
				}

				Appcelerator.Compiler.delegateToContainerProcessors(element, outer);
			}

			var compileId = id;
			var fieldset = element.getAttribute('fieldset');

			//
			// remove element
			//
			var removeId = element.id;
			if (removeElement)
			{
			    Appcelerator.Compiler.removeElementId(removeId);
				Element.remove(element);
			}

			if (outer)
			{
    			if (added && !$(id))
    			{
    				// set outer div only if widget id was not used in presentation
    				Appcelerator.Compiler.setElementId(outer, id);
    				compileId = id;
    				widgetParameters['id']=id;
    			}
			    outer.widget = module;
                outer.widgetParameters = widgetParameters;
			}

			//
			// attach any special widget functions
			//
			if (functions)
			{
				for (var c=0;c<functions.length;c++)
				{
					var methodname = functions[c];
					var method = module[methodname];
					if (!method) throw "couldn't find method named: "+methodname+" for module = "+module;
					(function()
					{
						var attachMethodName = functions[c];
						var attachMethod = module[methodname];
						var f = function(id,m,data,scope,version,customActionArguments,direction,type)
						{
							try
							{
								attachMethod(id,widgetParameters,data,scope,version,customActionArguments,direction,type);
							}
							catch (e)
							{
								$E('Error executing '+attachMethodName+' in module '+module.getWidgetName()+'. Error '+Object.getExceptionDetail(e)+', stack='+e.stack);
							}
						};
						Appcelerator.Compiler.attachFunction(id,attachMethodName,f);
					})();
				}
			}

			if(fieldset && !module.ignoreFieldset)
			{
			    Appcelerator.Compiler.addFieldSet(outer, false, fieldset);
			}

            //
            // run initialization
            //
            if (instructions.compile)
            {
                try
                {
                	module.compileWidget(widgetParameters,outer);
                }
                catch (exxx)
                {
                	Appcelerator.Compiler.handleElementException($(id), exxx, 'compiling widget ' + id + ', type ' + element.nodeName);
                	return;
                }
            }

            if (added && instructions.wire && outer)
            {
				Appcelerator.Compiler.compileElement(outer, state);
            }

            // reset the display for the widget
			if (outer)
			{
                outer.style.display='';
			}
		}
	}
	else
	{
		// reset to the original
		if (element.style && element.style.display != element.style.originalDisplay)
		{
		  element.style.display = element.style.originalDisplay;
		}
	}

	return compiledCode;
};

/**
 * fire an custom condition from within the widget.  
 */
Appcelerator.Compiler.fireCustomCondition = function(id, name, data)
{
	// let any listeners have at it
	Appcelerator.Compiler.fireConditionEvent(id,name);

	
    var observersForElement = Appcelerator.Compiler.customConditionObservers[id];
    if(observersForElement == null) {
        $D('no custom condition found for id="'+id+'"');
    }
    else if (observersForElement[name] == null)
    {
        $D('no custom condition found for id="'+id+'" condition="'+name+'"');
    }
    else
    {
        var entries = observersForElement[name];
        for(var i = 0; i < entries.length; i++) 
        {   
            var entry = entries[i];
            params = entry.params;
            var actionParams = params ? Appcelerator.Compiler.getParameters(params,false) : null;
        	var paramsStr = (actionParams) ? Object.toJSON(actionParams) : null;
            var ok = Appcelerator.Compiler.parseConditionCondition(paramsStr, data);
            
            var actionFunc;
            if (ok)
        	{
        	    actionFunc = Appcelerator.Compiler.makeConditionalAction(id,entry.action,entry.ifCond,data);
        	}
        	else if (elseaction)
        	{
        	    actionFunc = Appcelerator.Compiler.makeConditionalAction(id,entry.elseAction,entry.ifCond,data);
        	}
            Appcelerator.Compiler.executeAfter(actionFunc,entry.delay);
        }
    }
};


Appcelerator.Compiler.customConditionFunctionCallback = function(custCond)
{
    return function (element, condition, action, elseAction, delay, ifCond)
    {
        var id = element.id;
        var actionParams = Appcelerator.Compiler.parameterRE.exec(condition);
        var type = (actionParams ? actionParams[1] : condition);
        var params = actionParams ? actionParams[2] : null;
        if (type == custCond)
        {
            var entry =
            {
                'action': action,
                'delay': delay,
                'elseAction': elseAction,
                'ifCond': ifCond,
                'params': params
            }

            if(Appcelerator.Compiler.customConditionObservers[id] == null) {
                Appcelerator.Compiler.customConditionObservers[id] = {};
            }

            if (Appcelerator.Compiler.customConditionObservers[id][custCond])
            {
                Appcelerator.Compiler.customConditionObservers[id][custCond].push(entry);
            }
            else
            {
                Appcelerator.Compiler.customConditionObservers[id][custCond] = [entry];
            }
            return true;
        }
        return false;
    }
}
Appcelerator.Compiler.determineScope = function(element)
{
	var scope = element.getAttribute('scope');

	if (!scope)
	{
		var p = element.parentNode;
		if (p)
		{
			scope = p.scope;
		}

		if (!scope)
		{
			scope = 'appcelerator';
		}
	}
	element.scope = scope;
};

Appcelerator.Compiler.parseOnAttribute = function(element)
{
    try
    {
    	var on = element.getAttribute('on');
    	if (on && Object.isString(on))
    	{
		    $D('parseOnAttribute ',element.id,' on=',on);
    		Appcelerator.Compiler.compileExpression(element,on,false);
    		return true;
    	}
    }
	catch (exxx)
	{
		Appcelerator.Compiler.handleElementException(element, exxx, 'compiling "on" attribute for element ' + element.id);
	}
	return false;
};

Appcelerator.Compiler.smartTokenSearch = function(searchString, value)
{
	var validx = -1;
	if (searchString.indexOf('[') > -1 && searchString.indexOf(']')> -1)
	{
		var possibleValuePosition = searchString.indexOf(value);
		if (possibleValuePosition > -1)
		{
			var in_left_bracket = false;
			for (var i = possibleValuePosition; i > -1; i--)
			{
				if (searchString.charAt(i) == ']')
				{
					break;
				}
				if (searchString.charAt(i) == '[')
				{
					in_left_bracket = true;
					break;
				}
			}
			var in_right_bracket = false;
			for (var i = possibleValuePosition; i < searchString.length; i++)
			{
				if (searchString.charAt(i) == '[')
				{
					break;
				}
				if (searchString.charAt(i) == ']')
				{
					in_right_bracket = true;
					break;
				}
			}

			if (in_left_bracket && in_right_bracket)
			{
				validx = -1;
			} else
			{
				validx = searchString.indexOf(value);
			}
		} else validx = possibleValuePosition;
	}
	else
	{
		validx = searchString.indexOf(value);
	}
	return validx;
};

Appcelerator.Compiler.compoundCondRE = /^\((.*)?\) then$/;

Appcelerator.Compiler.parseExpression = function(value,element)
{
	if (!value)
	{
		return [];
	}

	if (!Object.isString(value))
	{
		alert('framework error: value was '+value+' -- unexpected type: '+typeof(value));
	    throw "value: "+value+" is not a string!";
	}
	value = value.gsub('\n',' ');
	value = value.gsub('\r',' ');
	value = value.gsub('\t',' ');
	value = value.trim();

	var thens = [];
	var ors = Appcelerator.Compiler.smartSplit(value,' or ');
	
	for (var c=0,len=ors.length;c<len;c++)
	{
		var expression = ors[c].trim();
		var thenidx = expression.indexOf(' then ');
		if (thenidx <= 0)
		{
			// we allow widgets to have a short-hand syntax for execute
			if (Appcelerator.Compiler.getTagname(element).indexOf(':'))
			{
				expression = expression + ' then execute';
				thenidx = expression.indexOf(' then ');
			}
			else
			{
				throw "syntax error: expected 'then' for expression: "+expression;
			}
		}
		var condition = expression.substring(0,thenidx);
		
		// check to see if we have compound conditions - APPSDK-597
		var testExpr = expression.substring(0,thenidx+5);
		var condMatch = Appcelerator.Compiler.compoundCondRE.exec(testExpr);
		if (condMatch)
		{
			var expressions = condMatch[1];
			// turn it into an array of conditions
			condition = Appcelerator.Compiler.smartSplit(expressions,' or ');
		}
		
		var elseAction = null;
		var nextstr = expression.substring(thenidx+6);
		var elseidx = Appcelerator.Compiler.smartTokenSearch(nextstr, 'else');

		var increment = 5;
		if (elseidx == -1)
		{
			elseidx = nextstr.indexOf('otherwise');
			increment = 10;
		}
		var action = null;
		if (elseidx > 0)
		{
			action = nextstr.substring(0,elseidx-1);
			elseAction = nextstr.substring(elseidx + increment);
		}
		else
		{
			action = nextstr;
		}

		var nextStr = elseAction || action;
		var ifCond = null;
		var ifIdx = nextStr.indexOf(' if expr[');

		if (ifIdx!=-1)
		{
			var ifStr = nextStr.substring(ifIdx + 9);
			var endP = ifStr.indexOf(']');
			if (endP==-1)
			{
				throw "error in if expression, missing end parenthesis at: "+action;
			}
			ifCond = ifStr.substring(0,endP);
			if (elseAction)
			{
				elseAction = nextStr.substring(0,ifIdx);
			}
			else
			{
				action = nextStr.substring(0,ifIdx);
			}
			nextStr = ifStr.substring(endP+2);
		}

		var delay = 0;
		var afterIdx =  Appcelerator.Compiler.smartTokenSearch(nextstr, 'after ');

		if (afterIdx!=-1)
		{
			var afterStr = nextStr.substring(afterIdx+6);
			delay = Appcelerator.Util.DateTime.timeFormat(afterStr);
			if (!ifCond)
			{
				if (elseAction)
				{
					elseAction = nextStr.substring(0,afterIdx-1);
				}
				else
				{
					action = nextStr.substring(0,afterIdx-1);
				}
			}
		}

		thens.push([null,condition,action,elseAction,delay,ifCond]);
	}
	return thens;
};

Appcelerator.Compiler.compileExpression = function (element,value,notfunction)
{
	value = Appcelerator.Compiler.processMacros(value,element.id);
	if (!value)
	{
		alert('value returned null for '+element.id);
	}
	var clauses = Appcelerator.Compiler.parseExpression(value,element);
	$D('on expression for ',element.id,' has ',clauses.length,' condition/action pairs');
	for(var i = 0; i < clauses.length; i++)
	{
		var clause = clauses[i];
        $D('compiling expression for ',element.id,' => condition=[',clause[1],'], action=[',clause[2],'], elseAction=[',clause[3],'], delay=[',clause[4],'], ifCond=[',clause[5],']');

        clause[0] = element;
		var handled = false;
		
		if (Object.isArray(clause[1]))
		{
			for (var c=0;c<clause[1].length;c++)
			{
				var cl = clause[1][c];
				var copy = [element,cl,clause[2],clause[3],clause[4],clause[5]];

		        handled = Appcelerator.Compiler.handleCondition.call(this, copy);
		        if (!handled)
		        {
		            throw "syntax error: unknown condition type: "+clause[1]+" for "+value;
		        }
			}
			continue;
		}
		
		
        handled = Appcelerator.Compiler.handleCondition.call(this, clause);

        if (!handled)
        {
            throw "syntax error: unknown condition type: "+clause[1]+" for "+value;
        }
	}
};

Appcelerator.Compiler.isIDRef = function(value)
{
	if (value)
	{
		if (Object.isString(value))
		{
			return value.charAt(0)=='$';
		}
	}
	return false;
};

Appcelerator.Compiler.parseConditionCondition = function(actionParamsStr,data) 
{
    var ok = true;
    var actionParams = actionParamsStr ? actionParamsStr.evalJSON() : null;

    if (actionParams)
    {
    	for (var c=0,len=actionParams.length;c<len;c++)
    	{
    		var p = actionParams[c];
			var negate = false, regex = false;
			if (p.empty && p.value)
			{
				// swap these out
				p.key = p.value;
				p.keyExpression = p.valueExpression;
				p.value = null;
			}
			var lhs = p.key, rhs = p.value, operator = p.operator||'';
			if (p.key && p.key.charAt(0)=='!')
			{
				negate = true;
				lhs = p.key.substring(1);
			}
			else if (p.key && p.key.charAt(p.key.length-1)=='!')
			{
				negate = true;
				lhs = p.key.substring(0,p.key.length-1);
			}
			var preLHS = lhs;
			if (p.keyExpression || Appcelerator.Compiler.isIDRef(lhs))
			{
				var out = Appcelerator.Compiler.getEvaluatedValue(lhs,data,data,p.keyExpression);
				if (!p.keyExpression && Appcelerator.Compiler.isIDRef(lhs) && lhs == out)
				{
					lhs = null;
				}
				else
				{
					lhs = out;
				}
			}
			else
			{
				lhs = Appcelerator.Compiler.getEvaluatedValue(lhs,data);
			}
			if (lhs == preLHS)
			{
				// left hand side must evaluate to a value -- if we get here and it's the same, that 
				// means we didn't find it
				lhs = null;
			}
			// mathematics
			if ((operator == '<' || operator == '>') && (rhs && Object.isString(rhs) && rhs.charAt(0)=='='))
			{
				operator += '=';
				rhs = rhs.substring(1);
			}
			if (rhs && Object.isString(rhs) && rhs.charAt(0)=='~')
			{
				regex = true;
				rhs = rhs.substring(1);
			}
			if (p.empty)
			{
				rhs = lhs;
			}
			else if (p.keyExpression || Appcelerator.Compiler.isIDRef(rhs))
			{
				var out = Appcelerator.Compiler.getEvaluatedValue(rhs,data,data,p.valueExpression);
				if (!p.valueExpression && Appcelerator.Compiler.isIDRef(rhs) && rhs == out)
				{
					rhs = null;
				}
				else
				{
					rhs = out;
				}
			}
			else
			{
				rhs = Appcelerator.Compiler.getEvaluatedValue(rhs,data);
			}
			if (regex)
			{
				var r = new RegExp(rhs);
				ok = r.test(lhs);
			}
			else if (!operator && p.empty && rhs == null)
			{
				ok = lhs;
			}
			else
			{
				switch(operator||'=')
				{
					case '<':
					{
						ok = parseInt(lhs) < parseInt(rhs);
						break;
					}
					case '>':
					{
						ok = parseInt(lhs) > parseInt(rhs);
						break;
					}
					case '<=':
					{
						ok = parseInt(lhs) <= parseInt(rhs);
						break;
					}
					case '>=':
					{
						ok = parseInt(lhs) >= parseInt(rhs);
						break;
					}
					default:
					{
						ok = String(lhs) == String(rhs);
						break;
					}
				}
			}
			if (negate)
			{
				ok = !ok;
			}
			if (!ok)
			{
				break;
			}
		}
	}
	return ok;
};

/*
 * Conditions trigger the execution of on expressions,
 * customConditions is a list of parsers that take the left-hand-side
 * of an on expression (before the 'then') and register event listeners
 * to be called when the condition is true.
 *
 * Parsers registered with registerCustomCondition are called in order
 * until one of them successfully parses the condition and returns true.
 */
Appcelerator.Compiler.customConditions = [];
Appcelerator.Compiler.customElementConditions = [];

Appcelerator.Compiler.registerCustomCondition = function(metadata, condition, elementid)
{
	condition.metadata = metadata;
	if (!elementid)
	{
    	Appcelerator.Compiler.customConditions.push(condition);
	}
	else
	{
    	Appcelerator.Compiler.customElementConditions.push({elementid: elementid, condition: condition});
	}
};

Appcelerator.Compiler.conditionListeners = {};

/**
 * register for when a condition is begin fired for an element
 */
Appcelerator.Compiler.registerConditionListener = function(element,condition,callback)
{
	var key = $(element).id + "__" + condition;
	var listeners = Appcelerator.Compiler.conditionListeners[key];
	if (!listeners)
	{
		listeners = [];
		Appcelerator.Compiler.conditionListeners[key]=listeners;
	}
	listeners.push(callback);
};

Appcelerator.Compiler.fireConditionEvent = function(element,condition)
{
	var key = $(element).id + "__" + condition;
	var listeners = Appcelerator.Compiler.conditionListeners[key];
	if (listeners)
	{
		for (var c=0;c<listeners.length;c++)
		{
			listeners[c]($(element),condition);
		}
	}
};

Appcelerator.Compiler.handleCondition = function(clause)
{
    var element = clause[0];
    $D('handleCondition called for ',element);

	if (clause[1] && Object.isBoolean(clause[1]))
	{
	    var f = Appcelerator.Compiler.makeAction(element.id,clause[2]);
		return f.call(this,clause[3]);
	}
	
    //first loop through custom conditions defined by the widget
    for (var f=0;f<Appcelerator.Compiler.customElementConditions.length;f++)
    {
        var cond = Appcelerator.Compiler.customElementConditions[f];
        if (cond.elementid == element.id)
        {
            var condFunction = cond.condition;
            var processed = condFunction.apply(condFunction,clause);
     		if (processed)
     		{
     			return true;
     		}
        }
    }

	for (var f=0;f<Appcelerator.Compiler.customConditions.length;f++)
	{
		var condFunction = Appcelerator.Compiler.customConditions[f];
		var processed = condFunction.apply(condFunction,clause);
 		if (processed)
 		{
 			return true;
 		}
 	}
 	return false;
};

Appcelerator.Compiler.getConditionsMetadata = function() {
	return Appcelerator.Compile.customConditions.pluck('metadata');
}

// TODO: Appcelerator.Compiler.getConditionsRegex


Appcelerator.Compiler.parameterRE = /(.*?)\[(.*)?\]/i;
Appcelerator.Compiler.expressionRE = /^expr\((.*?)\)$/;

Appcelerator.Compiler.customActions = {};
Appcelerator.Compiler.customElementActions = {};
Appcelerator.Compiler.registerCustomAction = function(name,callback,element)
{
	//
	// create a wrapper that will auto-publish events for each
	// action that can be subscribed to
	//
	var action = Object.clone(callback);
	action.build = function(id,action,params)
	{
		return [
			'try {',
			callback.build(id,action,params),
			'; }catch(exxx){Appcelerator.Compiler.handleElementException',
			'($("',id,'"),exxx,"Executing:',action,'");}'
		].join('');

	};

	if (callback.parseParameters)
	{
		action.parseParameters = callback.parseParameters;
	}
	if (!element)
	{
    	Appcelerator.Compiler.customActions[name] = action;
	}
	else
	{
    	Appcelerator.Compiler.customElementActions[name] = action;
	}
};

Appcelerator.Compiler.properCase = function (value)
{
	return value.charAt(0).toUpperCase() + value.substring(1);
};

Appcelerator.Compiler.smartSplit = function(value,splitter)
{
	value = value.trim();
	var tokens = value.split(splitter);
	if(tokens.length == 1) return tokens;
	var array = [];
	var current = null;
	for (var c=0;c<tokens.length;c++)
	{
		var line = tokens[c];
		if (!current && line.charAt(0)=='(')
		{
			current = line + ' or ';
			continue;
		}
		else if (current && current.charAt(0)=='(')
		{
			if (line.indexOf(') ')!=-1)
			{
				array.push(current+line);
				current = null;
			}
			else
			{
				current+=line + ' or ';
			}
			continue;
		}
		if (!current && line.indexOf('[')>=0 && line.indexOf(']')==-1)
		{
			if (current)
			{
				current+=splitter+line;
			}
			else
			{
				current = line;
			}
		}
		else if (current && line.indexOf(']')==-1)
		{
			current+=splitter+line;
		}
		else
		{
			if (current)
			{
				array.push(current+splitter+line)
				current=null;
			}
			else
			{
				array.push(line);
			}
		}
	}
	return array;
};

Appcelerator.Compiler.makeConditionalAction = function(id, action, ifCond, additionalParams)
{
	var actionFunc = function(scope)
	{
	    var f = Object.isFunction(action) ? action.bind(scope) : Appcelerator.Compiler.makeAction(id,action,additionalParams);
	    if (ifCond)
	    {
			if (Object.isUndefined(scope.id))
			{
				scope.id = id;
			}
			var passed = false;
			if (Object.isFunction(ifCond))
			{
				passed = ifCond.call(scope);
			}
			else
			{
				passed = Object.evalWithinScope(ifCond,scope);
			}
			if (passed)
			{
	            f(scope);
			}
	    }
	    else
	    {
	        f(scope);
	    }
	};
	return actionFunc;
};

/**
 * make an valid javascript function for executing the
 * action - this string must be converted to a function
 * object before executing
 *
 * @param {string} id of the element
 * @param {string} value of the action string
 * @param {object} optional parameters to pass to action
 * @return {string} action as javascript
 */
Appcelerator.Compiler.makeAction = function (id,value,additionalParams)
{
    var actionFuncs = [];
	var actions = Appcelerator.Compiler.smartSplit(value.trim(),' and ');

	for (var c=0,len=actions.length;c<len;c++)
	{
        (function()
        {
    		var actionstr = actions[c].trim();
			var wildcard = actionstr.startsWith('both:') || actionstr.startsWith('*:');
    		var remote_msg = !wildcard && actionstr.startsWith('remote:') || actionstr.startsWith('r:');
    		var local_msg = !remote_msg && (actionstr.startsWith('local:') || actionstr.startsWith('l:'));
    		var actionParams = Appcelerator.Compiler.parameterRE.exec(actionstr);
    		var params = actionParams!=null ? Appcelerator.Compiler.getParameters(actionParams[2].trim(),false) : null;
    		var action = actionParams!=null ? actionParams[1] : actionstr;

			params = params || [];
			if (additionalParams)
			{
				for (var p in additionalParams)
				{
					params.push({key:p,value:additionalParams[p]});
				}
			}
    		if (local_msg || remote_msg || wildcard)
    		{
    			var f = function(scope)
    			{
					var newparams = {};
					for (var x=0;x<params.length;x++)
					{
						var entry = params[x];
						var key = entry.key, value = entry.value;
						if (entry.keyExpression)
						{
							key = Appcelerator.Compiler.getEvaluatedValue(entry.key,null,scope,entry.keyExpression);
						}
						else if (entry.valueExpression)
						{
							value = Appcelerator.Compiler.getEvaluatedValue(entry.value,null,scope,entry.valueExpression);
						}
						else if (entry.empty)
						{
							value = Appcelerator.Compiler.getEvaluatedValue(entry.key,null,scope);
						}
						else
						{
							key = Appcelerator.Compiler.getEvaluatedValue(entry.key);
							value = Appcelerator.Compiler.getEvaluatedValue(entry.value,null,scope);
						}
						newparams[key]=value;
					}
    			    Appcelerator.Compiler.fireServiceBrokerMessage(id, action, newparams, scope);
    			}
    			actionFuncs.push({func: f, action: action});
    		}
    		else
    		{
    		    var builder = Appcelerator.Compiler.customElementActions[action];
                if (!builder)
                {
        			builder = Appcelerator.Compiler.customActions[action];
                }
    			if (!builder)
    			{
    				throw "syntax error: unknown action: "+action+" for "+id;
    			}

    			//
    			// see if the widget has its own parameter parsing routine
    			//
    			var f = builder.parseParameters;

    			if (f && Object.isFunction(f))
    			{
    				// this is called as a function to custom parse parameters in the action between brackets []
    				params = f(id,action,actionParams?actionParams[2]||actionstr:actionstr);
    			}

    			//
    			// delegate to our pluggable actions to make it easy
    			// to extend the action functionality
    			//
    			var f = function(scope)
    			{
					scope = scope || window;
					if (Object.isArray(params))
					{
						for (var x=0;x<params.length;x++)
						{
							var entry = params[x];
							if (entry.keyExpression)
							{
								entry.key = Appcelerator.Compiler.getEvaluatedValue(entry.key,scope.data,scope,entry.keyExpression);
							 	entry.keyExpression = false;
							}
							else if (entry.valueExpression)
							{
								entry.value = Appcelerator.Compiler.getEvaluatedValue(entry.value,scope.data,scope,entry.valueExpression);
								entry.valueExpression = false;
								if (entry.empty)
								{
									entry.key = entry.value;
								}
							}
							else if (entry.empty)
							{
								entry.value = Appcelerator.Compiler.getEvaluatedValue(entry.key,scope.data,scope);
							}
							else
							{
								entry.key = Appcelerator.Compiler.getEvaluatedValue(entry.key);
								entry.value = Appcelerator.Compiler.getEvaluatedValue(entry.value,scope.data,scope);
							}
						}
					}
    			    builder.execute(id, action, params, scope);
    			}
    			actionFuncs.push({func: f, action: action});
    		}
        })();
	}
    var actionFunction = function(scope)
    {
		var perf = Appcelerator.Config['perfmon'];
        for (var i=0; i < actionFuncs.length; i++)
        {
            actionFunc = actionFuncs[i];
            var timeStart = null;
            if (perf)
            {
                timeStart = new Date;
            }
            actionFunc.func(scope);
            if (perf)
            {
                var time = (new Date).getTime() - timeStart.getTime();
                $MQ('l:perfmon.action', {id: id, action: actionFunc.action, time: time});
            }
        }
    }
	return actionFunction;
};

Appcelerator.Compiler.convertMessageType = function(type)
{
	return Appcelerator.Util.ServiceBroker.convertType(type);
};

Appcelerator.Compiler.getMessageType = function (value)
{
	var actionParams = Appcelerator.Compiler.parameterRE.exec(value);
	return Appcelerator.Compiler.convertMessageType(actionParams && actionParams.length > 0 ? actionParams[1] : value);
};

Appcelerator.Compiler.fireServiceBrokerMessage = function (id, type, args, scopedata)
{
    (function()
    {
		var data = args || {};
		var element = $(id);
		var fieldset = null;
		var scope = null;
		if (element)
		{
			fieldset = element.getAttribute('fieldset');
			scope = element.scope;
		}
		
		for (var p in data)
		{
			var entry = data[p];
			data[p] = Appcelerator.Compiler.getEvaluatedValue(entry,data,scopedata);
		}

		var localMode = type.startsWith('local:') || type.startsWith('l:');

		if (fieldset)
		{
            Appcelerator.Compiler.fetchFieldset(fieldset, localMode, data);
		}

		if (localMode)
		{
			if (data['id'] == null)
			{
                data['id'] = id;
			}

		    if (data['element'] == null)
            {
				// this might not be the element that triggered the message,
				// but the element corresponding to an explicit id parameter
                data['element'] = $(data['id']);
            }
		}

		if (!scope || scope == '*')
		{
			scope = 'appcelerator';
		}

		$MQ(type,data,scope);
	}).defer();
};


/*
 Pluck the current values from a fieldset and return in a hash/dict/object.
 If a third argument is passed, the key/value pairs from the fieldset will be added to that object. 
*/
Appcelerator.Compiler.fetchFieldset = function(fieldset, localMode, data) {
    if(!data) {
        data = {};
    }
    
    var fields = Appcelerator.Compiler.fieldSets[fieldset];
	if (fields && fields.length > 0)
	{
		for (var c=0,len=fields.length;c<len;c++)
		{
			var fieldid = fields[c];
			var field = $(fieldid);
			var name = field.getAttribute('name') || fieldid;
            
            // don't overwrite other values in the payload
			if (data[name] == null)
			{
				// special case type field we only want to add
				// the value if it's checked
				if (field.type == 'radio' && !field.checked)
				{
					continue;
				}
				var newvalue = Appcelerator.Compiler.getElementValue(field,true,localMode);
				var valuetype = typeof(newvalue);
				if (newvalue != null && (valuetype=='object' || newvalue.length > 0 || valuetype=='boolean'))
				{
					data[name] = newvalue;
				}
				else
				{
					data[name] = '';
				}
			}
			else
			{
			    if(field.type != 'radio')
			    {
			        Logger.warn('fieldset value for "'+name+'" ignored because it conflicts with existing data payload value');
		        }
			}
		}
	}
	return data;
};

/**
 * return the elements value depending on the type of
 * element it is
 *
 * @param {element} element to get value from
 * @param {boolean} dequote should we automatically dequote value
 * @return {string} value from element
 */
Appcelerator.Compiler.getElementValue = function (elem, dequote, local)
{
    elem = $(elem);
    dequote = (dequote==null) ? true : dequote;

    var widget = elem.widget
    if (widget)
    {
        if(elem.widget.getValue)
        {
            return elem.widget.getValue(elem.id, elem.widgetParameters);
        }
    }
    else
    {
        switch (Appcelerator.Compiler.getTagname(elem))
        {
            case 'input':
            {
                return Appcelerator.Compiler.getInputFieldValue(elem,true,local);
            }
            case 'select':
            {
                if(elem.hasAttribute('multiple'))
                {
                    var selected = [];
                    var options = elem.options;
                    var optionsLen = elem.options.length;
                    for(var i = 0; i < optionsLen; i++)
                    {
                        if(options[i].selected)
                        {
                            selected.push(options[i].value);
                        }
                    }
                    return selected;
                }
                break; // if not multi-select, we use 
            }
            case 'img':
            case 'iframe':
            {
                return elem.src;
            }
            case 'form':
            {
                //TODO
                return '';
            }
        }
        // allow the element to set the value otherwise use the
        // innerHTML of the component
        if (elem.value != undefined)
        {
            return elem.value;
        }
        return elem.innerHTML;
    }
};

/**
 * get the value of the input, suitable for messaging
 *
 * @param {element} element
 * @param {boolean} dequote
 * @param {boolean} local true if it is for a local message
 * @return {string} value
 */
Appcelerator.Compiler.getInputFieldValue = function(elem,dequote,local)
{
	var tagname = Appcelerator.Compiler.getTagname(elem);
	if (tagname != 'input' && tagname != 'textarea' && tagname != 'select')
	{
		return null;
	}

	local = local==null ? true : local;
	dequote = (dequote==null) ? false : dequote;
	var type = elem.getAttribute('type') || 'text';

	var v = Form.Element.Methods.getValue(elem);

	switch(type)
	{
		case 'checkbox':
			return (v == 'on' || v == 'checked');

		case 'password':
		{
			if (!local)
			{
				//
				// support hashing of one or more elements for the password
				//
				var hashElemId = elem.getAttribute('hash');
				if (hashElemId)
				{
					var hashValues = '';
					hashElemId.split(',').each(function(t)
					{
						var hashElem = $(hashElemId);
						if (hashElem)
						{
							hashValues += Appcelerator.Compiler.getInputFieldValue(hashElem,false,true);
						}
					});
					var hash = Appcelerator.Util.MD5.hex_md5(v + hashValues);
					return {
						'hash' : hash,
						'auth' : Appcelerator.Util.MD5.hex_md5(hash + Appcelerator.Util.Cookie.GetCookie('appcelerator-auth'))
					};
				}
			}
		}
	}
	return Appcelerator.Compiler.formatValue(v,!dequote);
};

Appcelerator.Compiler.getEvaluatedValue = function(v,data,scope,isExpression)
{
	if (v && typeof(v) == 'string')
	{
		if (!isExpression && v.charAt(0)=='$')
		{
			var varName = v.substring(1);
			var elem = $(varName);
			if (elem)
			{
				// dynamically substitute the value
				return Appcelerator.Compiler.getElementValue(elem,true);
			}
		}
        else if(!isExpression && !isNaN(parseFloat(v)))
        {
            //Assume that if they provided a number, they want the number back
            //this is important because in IE window[1] returns the first iframe
            return v;
        }
		else
		{
			// determine if this is a dynamic javascript
			// expression that needs to be executed on-the-fly
			var match = isExpression || Appcelerator.Compiler.expressionRE.exec(v);
			if (match)
			{
				var expr = isExpression ? v : match[1];
				var func = expr.toFunction();
				var s = scope ? Object.clone(scope) : {};
				if (data)
				{
					for (var k in data)
					{
						if (Object.isString(k))
						{
							s[k] = data[k];
						}
					}
				}
				return func.call(s);
			}

			if (scope)
			{
				var result = Object.getNestedProperty(scope,v,null);
				if (result)
				{
					return result;
				}
			}

			if (data)
			{
				return Object.getNestedProperty(data,v,v);
			}
		}
	}
	return v;
};

Appcelerator.Compiler.formatValue = function (value,quote)
{
	quote = (quote == null) ? true : quote;

	if (value!=null)
	{
		var type = typeof(value);
		if (type == 'boolean' || type == 'array' || type == 'object')
		{
			return value;
		}
		if (value == 'true' || value == 'false')
		{
			return value == 'true';
		}
		if (value.charAt(0)=="'" && quote)
		{
			return value;
		}
		if (value.charAt(0)=='"')
		{
			value = value.substring(1,value.length-1);
		}
		if (quote)
		{
			return "'" + value + "'";
		}
		return value;
	}
	return '';
};

Appcelerator.Compiler.dequote = function(value)
{
	if (value && typeof value == 'string')
	{
		if (value.charAt(0)=="'" || value.charAt(0)=='"')
		{
			value = value.substring(1);
		}
		if (value.charAt(value.length-1)=="'" || value.charAt(value.length-1)=='"')
		{
			value = value.substring(0,value.length-1);
		}
	}
	return value;
};

Appcelerator.Compiler.convertInt = function(value)
{
	if (value.charAt(0)=='0')
	{
		if (value.length==1)
		{
			return 0;
		}
		return Appcelerator.Compiler.convertInt(value.substring(1));
	}
	return parseInt(value);
};

Appcelerator.Compiler.convertFloat = function(value)
{
	return parseFloat(value);
}

Appcelerator.Compiler.numberRe = /^[-+]{0,1}[0-9]+$/;
Appcelerator.Compiler.floatRe = /^[0-9]*[\.][0-9]*[f]{0,1}$/;
Appcelerator.Compiler.booleanRe = /^(true|false)$/;
Appcelerator.Compiler.quotedRe =/^['"]{1}|['"]{1}$/;
Appcelerator.Compiler.jsonRe = /^\{(.*)?\}$/;

var STATE_LOOKING_FOR_VARIABLE_BEGIN = 0;
var STATE_LOOKING_FOR_VARIABLE_END = 1;
var STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER = 2;
var STATE_LOOKING_FOR_VALUE_BEGIN = 3;
var STATE_LOOKING_FOR_VALUE_END = 4;
var STATE_LOOKING_FOR_VALUE_AS_JSON_END = 5;

Appcelerator.Compiler.decodeParameterValue = function(token,wasquoted)
{
	var value = null;
	if (token!=null && token.length > 0 && !wasquoted)
	{
		var match = Appcelerator.Compiler.jsonRe.exec(token);
		if (match)
		{
			value = String(match[0]).evalJSON();
		}
		if (!value)
		{
			var quoted = Appcelerator.Compiler.quotedRe.test(token);
			if (quoted)
			{
				value = Appcelerator.Compiler.dequote(token);
			}
			else if (Appcelerator.Compiler.floatRe.test(token))
			{
				value = Appcelerator.Compiler.convertFloat(token);
			}
			else if (Appcelerator.Compiler.numberRe.test(token))
			{
				value = Appcelerator.Compiler.convertInt(token);
			}
			else if (Appcelerator.Compiler.booleanRe.test(token))
			{
				value = (token == 'true');
			}
			else
			{
				value = token;
			}
		}
	}
	if (token == 'null' || value == 'null')
	{
		return null;
	}
	return value == null ? token : value;
};

Appcelerator.Compiler.parameterSeparatorRE = /[\$=:><!]+/;

/**
 * method will parse out a loosely typed json like structure
 * into either an array of json objects or a json object
 *
 * @param {string} string of parameters to parse
 * @param {boolean} asjson return it as json object
 * @return {object} value
 */
Appcelerator.Compiler.getParameters = function(str,asjson)
{
	if (str==null || str.length == 0)
	{
		return asjson ? {} : [];
	}
		
	var exprRE = /expr\((.*?)\)/;
	var containsExpr = exprRE.test(str);
	
	// this is just a simple optimization to 
	// check and make sure we have at least a key/value
	// separator character before we continue with this
	// inefficient parser
	if (!Appcelerator.Compiler.parameterSeparatorRE.test(str) && !containsExpr)
	{
		if (asjson)
		{
			var valueless_key = {};
			valueless_key[str] = '';
			return valueless_key;
		}
		else
		{
			return [{key:str,value:'',empty:true}];
		}
	}
	var state = 0;
	var currentstr = '';
	var key = null;
	var data = asjson ? {} : [];
	var quotedStart = false, tickStart = false;
	var operator = null;
	var expressions = containsExpr ? {} : null;
	if (containsExpr)
	{
		var expressionExtractor = function(e)
		{
			var start = e.indexOf('expr(');
			if (start < 0) return null;
			var p = start + 5;
			var end = e.length-1;
			var value = '';
			while ( true )
			{
				var idx = e.indexOf(')',p);
				if (idx < 0) break;
				value+=e.substring(p,idx);
				if (idx == e.length-1)
				{
					end = idx+1;
					break;
				}
				var b = false;
				var x = idx + 1;
				for (;x<e.length;x++)
				{
					switch(e.charAt(x))
					{
						case ',':
						{
							end = x;
							b = true;
							break;
						}
						case ' ':
						{
							break;
						}
						default:
						{
							p = idx+1;
							break;
						}
					}
				}
				if (x==e.length-1)
				{
					end = x;
					break;
				}
				if (b) break;
				value+=')';
			}
			var fullexpr = e.substring(start,end);
			return [fullexpr,value];
		};
		
		var ec = 0;
		while(true)
		{
			var m = expressionExtractor(str);
			if (!m)
			{
				break;
			}
			var k = '__E__'+(ec++);
			expressions[k] = m[1];
			str = str.replace(m[0],k);
		}
	}
	
	function transformValue(k,v,tick)
	{
		if (k && k.startsWith('__E__'))
		{
			if (!asjson)
			{
				return {key:expressions[k],value:v,keyExpression:true,valueExpression:false};
			}
			else
			{
				return eval(expressions[k]);
			}
		}
		if (v && v.startsWith('__E__'))
		{
			if (!asjson)
			{
				return {key:k,value:expressions[v],valueExpression:true,keyExpression:false};
			}
			else
			{
				return eval(expressions[v]);
			}
		}
		var s = Appcelerator.Compiler.decodeParameterValue(v,tick);
		if (!asjson)
		{
			return {key:k,value:s};
		}
		return s;
	}
	
	for (var c=0,len=str.length;c<len;c++)
	{
		var ch = str.charAt(c);
		var append = true;
		
		switch (ch)
		{
			case '"':
			case "'":
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_BEGIN:
					{
						quoted = true;
						append = false;
						state = STATE_LOOKING_FOR_VARIABLE_END;
						quotedStart = ch == '"';
						tickStart = ch=="'";
						break;
					}
					case STATE_LOOKING_FOR_VARIABLE_END:
					{
						var previous = str.charAt(c-1);
						if (quotedStart && ch=="'" || tickStart && ch=='"')
						{
							// these are OK inline
						}
						else if (previous != '\\')
						{
							state = STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER;
							append = false;
							key = currentstr.trim();
							currentstr = '';
						}
						break;
					}
					case STATE_LOOKING_FOR_VALUE_BEGIN:
					{
						append = false;
						quotedStart = ch == '"';
						tickStart = ch=="'";
						state = STATE_LOOKING_FOR_VALUE_END;
						break;
					}
					case STATE_LOOKING_FOR_VALUE_END:
					{
						var previous = str.charAt(c-1);
						if (quotedStart && ch=="'" || tickStart && ch=='"')
						{
							// these are OK inline
						}
						else if (previous != '\\')
						{
							state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
							append = false;
							if (asjson)
							{
								data[key]=transformValue(key,currentstr,quotedStart||tickStart);
							}
							else
							{
								data.push(transformValue(key,currentstr,quotedStart||tickStart));
							}
							key = null;
							quotedStart = false, tickStart = false;
							currentstr = '';
						}
						break;
					}
				}
				break;
			}
			case '>':
			case '<':
			case '=':
			case ':':
			{
				if (state == STATE_LOOKING_FOR_VARIABLE_END)
				{
					if (ch == '<' || ch == '>')
					{
						key = currentstr.trim();
						currentstr = '';
						state = STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER;
					}
				}
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_END:
					{
						append = false;
						state = STATE_LOOKING_FOR_VALUE_BEGIN;
						key = currentstr.trim();
						currentstr = '';
						operator = ch;
						break;
					}
					case STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER:
					{
						append = false;
						state = STATE_LOOKING_FOR_VALUE_BEGIN;
						operator = ch;
						break;
					}
				}
				break;
			}
			case ',':
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_BEGIN:
					{
						append = false;
						state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
						break;
					}
					case STATE_LOOKING_FOR_VARIABLE_END:
					{
						// we got to the end (single parameter with no value)
						state=STATE_LOOKING_FOR_VARIABLE_BEGIN;
						append=false;
						if (asjson)
						{
							data[currentstr]=null;
						}
						else
						{
							var entry = transformValue(key,currentstr);
							entry.operator = operator;
							entry.key = entry.value;
							entry.empty = true;
							data.push(entry);
						}
						key = null;
						quotedStart = false, tickStart = false;
						currentstr = '';
						break;
					}
					case STATE_LOOKING_FOR_VALUE_END:
					{
						if (!quotedStart && !tickStart)
						{
							state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
							append = false;
							if (asjson)
							{
								data[key]=transformValue(key,currentstr,quotedStart||tickStart);
							}
							else
							{
								var entry = transformValue(key,currentstr);
								entry.operator = operator;
								data.push(entry);
							}
							key = null;
							quotedStart = false, tickStart = false;
							currentstr = '';
						}
						break;
					}
				}
				break;
			}
			case ' ':
			{
			    break;
			}
			case '\n':
			case '\t':
			case '\r':
			{
				append = false;
				break;
			}
			case '{':
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VALUE_BEGIN:
					{
						state = STATE_LOOKING_FOR_VALUE_AS_JSON_END;
					}
				}
				break;
			}
			case '}':
			{
				if (state == STATE_LOOKING_FOR_VALUE_AS_JSON_END)
				{
					state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
					append = false;
					currentstr+='}';
					if (asjson)
					{
						data[key]=transformValue(key,currentstr,quotedStart||tickStart);
					}
					else
					{
						var entry = transformValue(key,currentstr);
						entry.operator = operator;
						data.push(entry);
					}
					key = null;
					quotedStart = false, tickStart = false;
					currentstr = '';
				}
				break;
			}
			default:
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_BEGIN:
					{
						state = STATE_LOOKING_FOR_VARIABLE_END;
						break;
					}
					case STATE_LOOKING_FOR_VALUE_BEGIN:
					{
						state = STATE_LOOKING_FOR_VALUE_END;
						break;
					}
				}
			}
		}
		if (append)
		{
			currentstr+=ch;
		}
		if (c + 1 == len && key)
		{
			//at the end
			currentstr = currentstr.strip();
			if (asjson)
			{
				data[key]=transformValue(key,currentstr,quotedStart||tickStart);
			}
			else
			{
				var entry = transformValue(key,currentstr);
				entry.operator = operator;
				data.push(entry);
			}
		}
	}

	if (currentstr && !key)
	{
		if (asjson)
		{
			data[key]=null;
		}
		else
		{
			var entry = transformValue(key,currentstr);
			entry.empty = true;
			entry.key = entry.value;
			entry.operator = operator;
			data.push(entry);
		}
	}
	// alert('=>'+Object.toJSON(data));
	return data;
};


/**
 * potentially delay execution of function if delay argument is specified
 *
 * @param {function} action to execute
 * @param {integer} delay value to execute in ms
 * @param {object} scope to invoke function in
 */
Appcelerator.Compiler.executeAfter = function(action,delay,scope)
{
	var f = (scope!=null) ? function() { action(scope); } : action;

	if (delay > 0)
	{
		f.delay(delay/1000);
	}
	else
	{
		f();
	}
};

/**
 * generic routine for handling painting error into element upon error
 *
 * @param {element} element
 * @param {exception} exception object
 * @param {string} context of error
 */
Appcelerator.Compiler.handleElementException = function(element,e,context)
{
	var tag = element ? Appcelerator.Compiler.getTagname(element) : document.body;
	var id = element ? element.id : '<unknown>';
	var msg = '<strong>Appcelerator Processing Error:</strong><div>Element ['+tag+'] with ID: '+ id +' has an error: <div>'+Object.getExceptionDetail(e,true)+'</div>' + (context ? '<div>in <pre>'+context+'</pre></div>' : '') + '</div>';
	$E(msg);
	if (element)
	{
		if (tag == 'IMG')
		{
			new Insertion.Before(element,msg);
		}
		else
		{
			element.innerHTML = '<div style="border:4px solid #777;padding:30px;background-color:#fff;color:#e00;font-family:sans-serif;font-size:18px;margin-left:20px;margin-right:20px;margin-top:100px;text-align:center;">' + msg + '</div>'
		}
		Element.show(element);
	}
};

Appcelerator.Compiler.fieldSets = {};

/**
 * add a fieldset
 *
 * @param {element} element to add to fieldset
 * @param {boolean} excludeself
 * @param {string}  optional name for the fieldset, overrides attribute on element
 *
 * @return {string} fieldset name or null if none found
 */
Appcelerator.Compiler.addFieldSet = function(element,excludeSelf,fieldsetName)
{
	excludeSelf = (excludeSelf==null) ? false : excludeSelf;
	fieldsetName = fieldsetName || element.getAttribute('fieldset');
	if (fieldsetName)
	{
		var fieldset = Appcelerator.Compiler.fieldSets[fieldsetName];
		if (!fieldset)
		{
			fieldset=[];
			Appcelerator.Compiler.fieldSets[fieldsetName] = fieldset;
		}
		if (false == excludeSelf)
		{
			$D('adding = ',element.id,' to field = ',fieldsetName,', values=',fieldset);
			fieldset.push(element.id);
		}
		return fieldset;
	}
	return null;
};

Appcelerator.Compiler.removeFieldSet = function(element)
{
	var fieldsetName = element.getAttribute('fieldset');
	if (fieldsetName)
	{
		var fieldset = Appcelerator.Compiler.fieldSets[fieldsetName];
		if (fieldset)
		{
			fieldset.remove(element.id);
		}
	}
};

Appcelerator.Compiler.updateFieldsetValues = function(fieldset, values, key)
{
	var data = Object.getNestedProperty(values, key, null);
	if (!data)
	{
		data = values;
	}

	if (fieldset)
	{
		var fields = Appcelerator.Compiler.fieldSets[fieldset];
		if (fields && fields.length > 0)
		{
			for (var c=0,len=fields.length;c<len;c++)
			{
				var fieldid = fields[c];
				var field = $(fieldid);
				var name = field.name || field.getAttribute('name') || fieldid;
				var val = Object.getNestedProperty(data, name, null);
				if (val != null)
				{
					Appcelerator.Compiler.setElementValue(field, val);
				}
			}
		}
	}
}

Appcelerator.Compiler.setElementValue = function (element, value)
{
    var revalidate = false;
    var fireChange = false;

    if (element && value != null)
    {
        var widget = element.widget;
        if (widget)
        {
            if (widget.setValue)
            {
                try
                {
                    widget.setValue(element.id, element.widgetParameters, value);
                }
                catch(e)
                {
                    $E(e);
                }
            }
        }
        else
        {
            switch (Appcelerator.Compiler.getTagname(element))
            {
                case 'input':
                {
                    var type = element.getAttribute('type') || 'text';
                    switch (type)
                    {
                        case 'password':
                        case 'hidden':
                        case 'text':
                        {
                            revalidate = true;
                            element.value = value;
                            break;
                        }
                        case 'button':
                        case 'submit':
                        {
                            element.value = value;
                            break;
                        }
                        case 'checkbox':
                        {
                            revalidate = true;
                            if (value == true || value == 'true')
                            {
                                element.checked = true;
                            }
                            else
                            {
                                element.checked = false;
                            }
                            break;
                        }
                        case 'radio':
                        {
                            revalidate = true;
                            if (value == element.getAttribute('value'))
                            {
                                element.checked = true;
                            }
                            else
                            {
                                element.checked = false;
                            }
                            break;
                        }
                    }
                    break;
                }
                case 'textarea':
                {
                    revalidate = true;
                    element.value = value;
                    break;
                }
                case 'select':
                {
                    if(element.hasAttribute('multiple'))
                    {
                        var values = Appcelerator.Util.makeSet(value)
                        var options = element.options;
                        for (var i = 0; i < options.length; i++)
                        {
                            var option = options[i];
                            if (values[option.value])
                            {
                                if(!option.selected)
                                {
                                    option.selected = true;
                                    fireChange = true;
                                    revalidate = true;
                                }
                                // else ignore, already selected
                            }
                            else
                            {
                                if(option.selected)
                                {
                                    option.selected = false;
                                    fireChange = true;
                                    revalidate = true;
                                }
                                // else ignore, already un-selected
                            }
                        }                        
                    }
                    else
                    {
                        var options = element.options;

                        for (var i = 0; i < options.length; i++)
                        {
                            if (options[i].value == value)
                            {
                                element.selectedIndex = i;
                                fireChange = true;
                                revalidate = true;
                                break;
                            }
                        }
                    }
                    break;
                }
                case 'a':
                {
                    element.href = value;
                    break;
                }
                case 'img':
                case 'iframe':
                {
                    element.src = value;
                    break;
                }
                default:
                {
                    element.innerHTML = value;
                    break;
                }
            }
        }
    }

    if(fireChange)
    {
        try {
            Event.cache[element._eventID]['change'][0]({});
        } catch(e) {
            $D('failed to fire change listener for element: '+element.id);
        }
    }

    if (revalidate)
    {
        Appcelerator.Compiler.executeFunction(element, "revalidate");
    }
}

Appcelerator.Compiler.CSSAttributes =
[
	'color',
	'cursor',
	'font',
	'font-family',
	'font-weight',
	'border',
	'border-right',
	'border-bottom',
	'border-left',
	'border-top',
	'border-color',
	'border-style',
	'border-width',
	'background',
	'background-color',
	'background-attachment',
	'background-position',
	'position',
	'display',
	'visibility',
	'overflow',
	'opacity',
	'filter',
	'top',
	'left',
	'right',
	'bottom',
	'width',
	'height',
	'margin',
	'margin-left',
	'margin-right',
	'margin-bottom',
	'margin-top',
	'padding',
	'padding-left',
	'padding-right',
	'padding-bottom',
	'padding-top'
];

Appcelerator.Compiler.isCSSAttribute = function (name)
{
	if (name == 'style') return true;

	for (var c=0,len=Appcelerator.Compiler.CSSAttributes.length;c<len;c++)
	{
		if (Appcelerator.Compiler.CSSAttributes[c] == name)
		{
			return true;
		}

		var css = Appcelerator.Compiler.CSSAttributes[c];
		var index = css.indexOf('-');
		if (index > 0)
		{
			var converted = css.substring(0,index) + css.substring(index+1).capitalize();
			if (converted == name)
			{
				return true;
			}
		}
	}
	return false;
};

Appcelerator.Compiler.convertCSSAttribute = function (css)
{
	var index = css.indexOf('-');
	if (index > 0)
	{
		var converted = css.substring(0,index) + css.substring(index+1).capitalize();
		return converted;
	}
	return css;
}

/**
 * start the compile once the document is loaded - we need to run this each
 * time and not just check when this file is loaded in case an external script
 * decides to turn off compiling on the fly
 */
Appcelerator.Util.ServerConfig.addConfigListener(function()
{
    if (Appcelerator.Compiler.compileOnLoad)
	{
        var outputHandler = Prototype.K;
        Appcelerator.Compiler.compileDocument(outputHandler);
	}
});


Appcelerator.Compiler.setHTML = function(element,html)
{
	$(element).innerHTML = html;
};

/**
 * attach a method which can dynamically compile an expression passed in
 * for a given element. this allows a more unobstrutive or standards based
 * approach for purists such as
 *
 * $('myelement').on('click then l:foo')
 */
var AppceleratorCompilerMethods =
{
    xon: function(re,webexpr,parameters,elseCond)
    {
	alert('re =>' + re + ' webexpr=>' + webexpr + ' parms=>' + parameters);
        Appcelerator.Compiler.destroy(re);
        if (parameters)
        {
			if (Object.isFunction(parameters))
			{
				// APPSDK-638 - programmatic on actions
				var copy = [re,webexpr,parameters,elseCond,0,null];
		        Appcelerator.Compiler.handleCondition(copy);
				return re;
			}
			else
			{
	            for (var key in parameters)
	            {
	                if (Object.isString(key))
	                {
	                    var value = parameters[key];
	                    if (Object.isString(value) || Object.isNumber(value) || Object.isBoolean(value))
	                    {
	                        re.setAttribute(key,value);
	                    }
	                }
	            }
	            Appcelerator.Compiler.delegateToAttributeListeners(re);
			}
        }
        Appcelerator.Compiler.compileExpression(re,webexpr,false);
        return re;
    },
	set: function(re,value,action)
	{
		var a = Appcelerator.Compiler.attributeProcessors['*'];
		for (var c=0;c<a.length;c++)
		{
			var entry = a[c];
			if (entry[0] == 'set')
			{
	            entry[1].handle(re,'set',value);
				break;
			}
		}
		return re;
	},
    get: function(e)
    {
        return $el(e);
    }
};
Element.addMethods(AppceleratorCompilerMethods);

/**
 * extend an array to support passing multiple elements with a single expression
 *
 * for example: $$('.myclass').on('click then l:foo')
 */
Object.extend(Array.prototype,
{
    on:function(webexpr,parameters)
    {
        for (var c=0;c<this.length;c++)
        {
           var e = this[c];
           if (e && Object.isElement(e) && Object.isFunction(e.on)) e.on(webexpr,parameters);
        }
        return this;
    },
    set:function(webexpr)
    {
        for (var c=0;c<this.length;c++)
        {
           var e = this[c];
           if (e && Object.isElement(e)) e.set(webexpr);
        }
        return this;
    },
	withoutAll:function(vals)
	{
		return this.without.apply(this, vals);
	}
});


Appcelerator.Compiler.macros = {};
Appcelerator.Compiler.macroRE = /(#[A-Za-z0-9_-]+(\[(.*)?\])?)/;

Appcelerator.Compiler.processMacros = function(expression,id,scope)
{
	return expression.gsub(Appcelerator.Compiler.macroRE,function(match)
	{
		var expr = match[0].substring(1);
		var key = expr;
		var idx1 = key.indexOf('[');
		var idx2 = idx1 > 0 ? key.lastIndexOf(']') : -1;
		if (idx1>0 && idx2>0)
		{
			key = key.substring(0,idx1);
		}
		var template = Appcelerator.Compiler.macros[key];
		if (template)
		{
			scope = scope || {};

			if (idx1>0 && idx2>0)
			{
				var options = expr.substring(idx1+1,idx2);
				options.split(',').each(function(p)
				{
					var tok = p.split('=');
					scope[tok[0].trim()]=tok[1].trim();
				});
			}
			if (id)
			{
				var idvalue = scope['id'];
				if (Object.isUndefined(idvalue))
				{
					scope['id'] = id;
				}
			}
			// recursive in case you reference a macro in a macro
			return Appcelerator.Compiler.processMacros(template(scope),id,scope);
		}
		return match[0];
	});
};

function $WEM(config)
{
	for (var name in config)
	{
		var value = config[name];
		if (Object.isString(value))
		{
			Appcelerator.Compiler.macros[name]=Appcelerator.Compiler.compileTemplate(value);
		}
	}
};


