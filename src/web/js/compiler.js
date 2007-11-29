/**
 * Appcelerator Compiler
 *
 */

//
// this should be set if you want the document to be 
// compiled when loaded
//
Appcelerator.Compiler.compileOnLoad = true;

//
// returns true if running in interpretive mode
// compilation is done at runtime in the browser
//
Appcelerator.Compiler.isInterpretiveMode = true;

//
// returns true if running in compiled mode
// compilation is done at deployment time
//
Appcelerator.Compiler.isCompiledMode = false;
Appcelerator.Compiler.compiledCode = '';
Appcelerator.Compiler.compiledDocument = null;
Appcelerator.Compiler.compiledJS = null;
// list of strings of code that forwards to attribute listeners handlers (in compiled mode)
Appcelerator.Compiler.compiledAttributeListeners = [];

//
// delay before showing loading message in number of milliseconds
//
Appcelerator.Compiler.delayBeforeLoadingMessage = 250;

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

Appcelerator.Compiler.getAndEnsureId = function(element)
{
	if (!element.id)
	{
		element.id = Appcelerator.Compiler.generateId();
	}
	
	appCompilerIdCache[element.id] = element;
	
	return element.id;
};

Appcelerator.Compiler.setElementId = function(element, id)
{
	delete appCompilerIdCache[id];	
	element.id = id;
	appCompilerIdCache[element.id] = element;	
}

Appcelerator.Compiler.removeElementId = function(id)
{
	delete appCompilerIdCache[id];	
}

function $(element) 
{
	if (arguments.length > 1) 
	{
    	for (var i = 0, elements = [], length = arguments.length; i < length; i++)
		{
			elements.push($(arguments[i]));
		}
    	return elements;
 	}

	if (Object.isString(element))
	{
		var id = element;
	 	element = appCompilerIdCache[id];
		
		if (!element)
		{
			element = document.getElementById(id);
		}
	}
	
	return Element.extend(element);
}

Appcelerator.Compiler.generateId = function()
{
	return 'app_' + (Appcelerator.Compiler.nextId++);
};

Appcelerator.Compiler.attributeProcessors = {'*':[]};

//
// register a function that has a method called handle that takes
// an element, attribute and the attribute value of the processed element.
// this method takes the name of the element (or optionally, null or * as
// a wildcard) and an attribute (required) value to look for on the element
// and a listener.  
//
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
		a.push([attribute,listener]);
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
			a.push([attribute,listener]);
		}
	}
};

Appcelerator.Compiler.forwardToAttributeListener = function(element,array,tagname)
{
    for (var i=0;i<array.length;i++)
	{
		var entry = array[i];
		var attributeName = entry[0];
		var listener = entry[1];
		var value = element.getAttribute(attributeName);
        if (value) // optimization to avoid adding listeners if the attribute isn't present
        {
            if (Appcelerator.Compiler.isCompiledMode)
            {
                Appcelerator.Compiler.compiledAttributeListeners.push([element.id,attributeName,tagname,i]);
            }
            else
            {
                listener.handle(element,attributeName,value);
            }
        }
    }
};

//
// internal method called to process each element and potentially one or
// more attribute processors
//
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
//
// add a listener that is fired when a container is created
//
Appcelerator.Compiler.addContainerProcessor = function(listener)
{
	Appcelerator.Compiler.containerProcessors.push(listener);
};

//
// remove container listener
//
Appcelerator.Compiler.removeContainerProcessor = function(listener)
{
	Appcelerator.Compiler.containerProcessors.remove(listener);
};

//
// called when a container is created
//
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

Appcelerator.Compiler.automatedIDRegex = /^a[0-9]+$/;

Appcelerator.Compiler.checkLoadState = function (state)
{
	if (state.pending==0 && state.scanned)
	{
		if (typeof(state.onfinish)=='function')
		{
			state.onfinish(code);
		}
				
		if (typeof(state.onafterfinish)=='function')
		{
			state.onafterfinish();
		}
	}	
};
//
// call this to dynamically compile a widget on-the-fly and evaluate
// any widget JS code as compiled
//
Appcelerator.Compiler.dynamicCompile = function(element)
{
    setTimeout(function()
    {    
	    var state = Appcelerator.Compiler.createCompilerState();
	    Appcelerator.Compiler.compileElement(element,state);
	    state.scanned = true;
	    Appcelerator.Compiler.checkLoadState(state);
    },0);
};

Appcelerator.Compiler.createCompilerState = function ()
{
	return {pending:0,code:'',scanned:false};
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
Appcelerator.Compiler.compileDocument = function(onFinishCompiled)
{
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

    if (!document.body.id || Appcelerator.Compiler.automatedIDRegex.test(document.body.id))
    {
        Appcelerator.Compiler.setElementId(document.body, 'app_body');
    }
    
    var state = Appcelerator.Compiler.createCompilerState();

    // start scanning at the body
    Appcelerator.Compiler.compileElement(container,state);

    // mark it as complete and check the loading state
    state.scanned = true;
    state.onafterfinish = function(code)
    {
        setTimeout(function()
        {
		    if (typeof(onFinishCompiled)=='function') onFinishCompiled();
		    if (originalVisibility!=container.style.visibility)
		    {
		       container.style.visibility = originalVisibility;
		    }
			Appcelerator.Compiler.compileDocumentOnFinish();
        },0);
    };
    Appcelerator.Compiler.checkLoadState(state);
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

Appcelerator.Compiler.compileElement = function(element,state)
{
	Appcelerator.Compiler.getAndEnsureId(element);
	Appcelerator.Compiler.determineScope(element);
	
	if (typeof(state)=='undefined')
	{
		throw "compileElement called without state for "+element.id;
	}
	
	Appcelerator.Compiler.onPrecompile(element);

	//TODO: check to see if we're already compiled and destroy
	//TODO: add compile on for security
	
	if (Appcelerator.Compiler.isInterpretiveMode)
	{
		element.compiled = 1;
	}

	// check to see if we should compile	
	var doCompile = element.getAttribute('compile') || 'true';
	if (doCompile == 'false')
	{
		if (Appcelerator.Compiler.isCompiledMode)
		{
			element.removeAttribute('compile');
		}
		return;
	}
	
	var name = Appcelerator.Compiler.getTagname(element);
	if (name.indexOf(':')>0)
	{
		element.style.originalDisplay = element.style.display || 'block';
		if (Appcelerator.Compiler.isCompiledMode)
		{
			var widgetJS = Appcelerator.Compiler.compileWidget(element,state);
			var code = 'setTimeout(function()';
			code += '{';
			code += 'Appcelerator.Core.require("'+name+'",function()'
			code += '{' + widgetJS + '});';
			code += '},0);';
			Appcelerator.Compiler.compiledCode += code;
		}
		else
		{
    		element.style.display='none';
			state.pending+=1;
			setTimeout(function()
			{
	            Appcelerator.Core.require(name,function()
	            {
	                Appcelerator.Compiler.compileWidget(element,state);
	                state.pending-=1;
	                Appcelerator.Compiler.checkLoadState(state);
	            });
			},0);
		}
	}	
	else
	{
		Appcelerator.Compiler.delegateToAttributeListeners(element);
		
		var elementChildren = [];
		for (var i = 0, length = element.childNodes.length; i < length; i++)
		{
	    	elementChildren.push(element.childNodes[i]);
		}
		for (var i=0,len=elementChildren.length;i<len;i++)
		{
			if (elementChildren[i] && elementChildren[i].nodeType == 1)
			{
				Appcelerator.Compiler.compileElement(elementChildren[i],state);
			}
		}
	}
};

Appcelerator.Compiler.destroy = function(element, recursive)
{
	recursive = recursive==null ? true : recursive;
	
	if (element.trashcan && element.trashcan.length > 0)
	{
		for (var c=0,len=element.trashcan.length;c<len;c++)
		{
			try
			{
				element.trashcan[c]();
			}
			catch(e)
			{
				// gulp
			}
		}
		try
		{
			delete element.trashcan;
			element.trashcan = null;
		}
		catch(e)
		{
			// yummy!
		}
	}
	
	if (recursive)
	{
		if (element.childNodes && element.childNodes.length > 0)
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
					}
				}
			}
		}
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

Appcelerator.Compiler.templateRE = /#\{(.*?)\}/g;
Appcelerator.Compiler.compileTemplate = function(html,htmlonly,varname)			 
{
	varname = varname==null ? 'f' : varname;
	
	var fn = function(m, name, format, args)
	{
		return "'; o = Object.getNestedProperty(values,'"+name+"','#{"+name+"}'); o = (typeof(o)=='object') ? o.toJSON() : o; str+=o; str+='";
	};
	var body = "var "+varname+" = function(values){ var o; var str = '" +
            html.replace(/(\r\n|\n)/g, '').replace(/\t/g,' ').replace(/'/g, "\\'").replace(Appcelerator.Compiler.templateRE, fn) +
            "'; return str; };" + (htmlonly?'':varname);
	
	var result = htmlonly ? body : eval(body);
	return result;
};

Appcelerator.Compiler.tagNamespaces = [];
if (Appcelerator.Browser.isIE)
{
    Appcelerator.Compiler.tagNamespaces.push('app');
}
else
{
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
}
Appcelerator.Compiler.removeHtmlPrefix = function(html)
{
    if (Appcelerator.Browser.isIE)
    {
        html = html.gsub(/<\?xml:namespace(.*?)\/>/i,'');
    }
    return html.gsub(/html:/i,'').gsub(/><\/img>/i,'/>');
};
//
// this super inefficient but nifty function will
// parse our HTML: namespace tags required when HTML is 
// included in APP: tags but as long as they are 
// not within a APP: tags content.  The browser
// doesn't like HTML: (he'll think it's a non-HTML tag)
// so we need to strip the HTML: before passing to browser
// as long as it's outside a appcelerator widget
//
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

//
// add event listener
//
Appcelerator.Compiler.addEventListener = function (element,event,action,delay)
{
	var logWrapper = function()
	{
		var args = $A(arguments);
		$D('on '+element.id+'.'+event+' => invoking action '+action);
		return action.apply({data:{}},args);
	};
	
	var functionWrapper = delay > 0 ? (function() {
		var args = $A(arguments);
		var a = function()
		{
			return logWrapper.apply(logWrapper,args);
		};
		setTimeout(a,delay);
	}) : logWrapper;
	
	Event.observe(element,event,functionWrapper,false);
	
	Appcelerator.Compiler.addTrash(element,function()
	{
		Event.stopObserving(element,event,functionWrapper);
	});
}

// 
// called to install a change listener
//
Appcelerator.Compiler.installChangeListener = function (element, action)
{
    setTimeout(function()
    {
	    var type = element.getAttribute('type') || 'text';
	    var tag = Appcelerator.Compiler.getTagname(element);
	    if (tag == 'select' || tag == 'textarea')
	    {
	        type = tag;
	    }
	    
	    switch(type)
	    {
	        case 'radio':
	        case 'checkbox':
	        { 
	            Appcelerator.Compiler.addEventListener(element,'click',action);
	            break;
	        }
	        case 'select':
	        {
	            Appcelerator.Compiler.addEventListener(element,'change',action);
	            break;
	        }
	        case 'input':
	        case 'textarea':
	        default:
	        {
	            if (Appcelerator.Browser.isIE)
	            {
	                Appcelerator.Compiler.addEventListener(element,'keyup',action);
	                // as usual, for IE, you have to wait a bit before
	                // you can determine if there's a value
	                var delayedListener = function()
	                {
	                    return Appcelerator.Compiler.executeAfter(action,100);
	                };
	                Appcelerator.Compiler.addEventListener(element,'paste',delayedListener);
	            }
	            else
	            {
	                if (type == 'file')
	                {
	                    Appcelerator.Compiler.addEventListener(element,'change',action);
	                }
	                else
	                {
	                    if (Appcelerator.Browser.isSafari && type == 'textarea')
	                    {
	                        Appcelerator.Compiler.addEventListener(element,'keyup',action);
	                    }
	                    else
	                    {
	                        // changed from 'input' 
	                        Appcelerator.Compiler.addEventListener(element,'keyup',action);
	                    }
	                }
	            }
	            break;
	        }
	    }
    },0);
};

Appcelerator.Compiler.ElementFunctions = {};

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

Appcelerator.Compiler.attachFunction = function(element,name,f)
{
	var id = (typeof element == 'string') ? element : element.id;
	var key = id + '_' + name;
	Appcelerator.Compiler.ElementFunctions[key]=f;		
};

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
			default:
				throw "too many arguments - only 8 supported currently for method: "+name+", you invoked with "+args.length+", args was: "+Object.toJSON(args);
		}
	}
	if (element)
	{
		//
	    // NOTE: you must call the function as below since
		// natively wrapped methods like focus won't work if you
		// try and use the normal javascript prototype call/apply
		// methods on them
		//
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

//
// called to compile a widget
//
Appcelerator.Compiler.compileWidget = function(element,state)
{
	var name = Appcelerator.Compiler.getTagname(element);
	var module = Appcelerator.Core.widgets[name];
	var compiledCode = '';
	
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
		// parse on attribute
		//
		if (!Appcelerator.Compiler.isCompiledMode)
		{
			Appcelerator.Compiler.parseOnAttribute(element);
		}
		
		//
		// hande off widget for building
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
					//TODO: look to see how we can deal with this without adding DIV so we 
					//can support things like TR inside an iterator
					html = '<div id="'+id+'_temp" style="margin:0;padding:0;display:none">'+html+'</div>';
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

			//
			// remove element
			//
			if (removeElement)
			{
				if (Appcelerator.Compiler.isCompiledMode)
				{
					// add an empty div to handle attribute processors
					var replacedId = Appcelerator.Compiler.generateId();
					var replaceHtml = '<div id="'+replacedId+'" '+Appcelerator.Util.Dom.getAttributesString(element,['style','id'])+' style="margin:0;padding:0;display:none"/>';
					new Insertion.Before(element,replaceHtml);
					compiledCode += 'Appcelerator.Compiler.parseOnAttribute($("'+replacedId+'"));';
				}
				
				Appcelerator.Compiler.removeElementId(id);
				Element.remove(element);				
			}
			
			if (added && outer && !$(id))
			{
				// set outer div only if widget id was not used in presentation
				Appcelerator.Compiler.setElementId(outer, id);
			}
			
			// 
			// attach any special widget functions
			// 				
			var functions = instructions.functions;
			if (functions)
			{
				for (var c=0;c<functions.length;c++)
				{
					var name = functions[c];
					var method = module[name];
					if (!method) throw "couldn't find method named: "+name+" for module = "+module;
					
					if (Appcelerator.Compiler.isCompiledMode)
					{
						var paramsJSON = Object.toJSON(widgetParameters).gsub('\\\\\\\"','\\\\\\\"').gsub('\\\'','\\\'');
						compiledCode += 'var f = function(id,m,data,scope)';
						compiledCode += '{';
						compiledCode += 'try';
						compiledCode += '{';
						compiledCode += 'var method = Appcelerator.Core.widgets["'+name+'"];';
						compiledCode += 'method(id,\''+paramsJSON+'\'.evalJSON(),data,scope);';
						compiledCode += '}';
						compiledCode += 'catch (e) {';
						compiledCode += '$E("Error executing '+name+' in module '+module.toString()+'. Error "+Object.getExceptionDetail(e)+", stack="+e.stack);';
						compiledCode += '}';
						compiledCode += '};';
						compiledCode += 'Appcelerator.Compiler.attachFunction("'+id+'","'+name+'",f);';
					}
					else
					{
						var f = function(id,m,data,scope)
						{
							try
							{
								method(id,widgetParameters,data,scope);
							}
							catch (e)
							{
								$E('Error executing '+name+' in module '+module.toString()+'. Error '+Object.getExceptionDetail(e)+', stack='+e.stack);
							}
						};
						Appcelerator.Compiler.attachFunction(id,name,f);
					}
				}
			}
			
            //
            // run initialization
            //
            if (instructions.compile)
            {
				if (Appcelerator.Compiler.isCompiledMode)
				{
					var paramsJSON = Object.toJSON(widgetParameters).gsub('\\\\\\\"','\\\\\\\"').gsub('\\\'','\\\'');
					compiledCode += 'try';
					compiledCode += '{';
					compiledCode += 'var module = Appcelerator.Core.widgets["'+name+'"];';
					if (outer)
					{
						compiledCode += 'module.compileWidget(\''+paramsJSON+'\'.evalJSON(),$("'+outer.id+'"));';
					}
					else
					{
						compiledCode += 'module.compileWidget(\''+paramsJSON+'\'.evalJSON(),null);';
					}
					compiledCode += '}';
					compiledCode += 'catch (exxx) {';
					compiledCode += 'Appcelerator.Compiler.handleElementException($("'+id+'"), exxx, "compiling widget '+id+', type '+element.nodeName+'");';
					compiledCode += 'return;';
					compiledCode += '}';
				}
				else
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
            }
            
            if (added && instructions.wire && outer)
            {
				if (Appcelerator.Compiler.isCompiledMode)
				{
					compiledCode += 'Appcelerator.Compiler.dynamicCompile($("'+outer+'"));'; // is dynamic ok?
				}
				else
				{
                	Appcelerator.Compiler.compileElement(outer, state);
				}
            }

            // fix any issues from the new HTML (only matters in IE6 otherwise no-op)
			if (Appcelerator.Compiler.isCompiledMode)
			{
            	compiledCode += 'Appcelerator.Browser.fixImageIssues();';
			}
			else
			{
            	Appcelerator.Browser.fixImageIssues();
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
	if (Appcelerator.Compiler.isCompiledMode)
	{
		Appcelerator.Compiler.scopeMap[element.id]=scope;
	}
	element.scope = scope;
};

Appcelerator.Compiler.parseOnAttribute = function(element)
{
	var on = element.getAttribute('on');
	if (on)
	{
		Appcelerator.Compiler.compileExpression(element,on,false);
		return true;
	}
	return false;
};

Appcelerator.Compiler.compileExpression = function (element,value,notfunction)
{
    value = value.gsub('\n',' ');
    value = value.gsub('\r',' ');
    value = value.gsub('\t',' ');
    value = value.trim();

    var ors = Appcelerator.Compiler.smartSplit(value,' or ');
	
	for (var c=0,len=ors.length;c<len;c++)
	{
		var expression = ors[c].trim();
		var thenidx = expression.indexOf(' then ');
		if (thenidx <= 0)
		{
			throw "syntax error: expected 'then' for expression: "+expression;
		}
		var condition = expression.substring(0,thenidx);
		var elseAction = null;
		var nextstr = expression.substring(thenidx+6);
		var elseidx = -1;
		if (nextstr.indexOf('['))
		{
			var result = Appcelerator.Compiler.smartSplit(nextstr,'else');
			if (result.length > 1)
			{
				elseidx = result[0].length;
			}
			else
			{
				elseidx = result[0].length+1;
			}
		}
		else
		{
			elseidx = nextstr.indexOf('else');		
		}
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
		var afterIdx = nextStr.indexOf('after ');
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
		
		$D('compiling condition=['+condition+'], action=['+action+'], elseAction=['+elseAction+'], delay=['+delay+'], ifCond=['+ifCond+']');
		
		var handled = Appcelerator.Compiler.handleCondition(element,condition,action,elseAction,delay,ifCond);
		
		if (!handled)
		{
			throw "syntax error: unknown condition type: "+condition+" for "+value;
		}
	}
};

Appcelerator.Compiler.customConditions = [];

Appcelerator.Compiler.registerCustomCondition = function(condition)
{
	Appcelerator.Compiler.customConditions.push(condition);
};

Appcelerator.Compiler.handleCondition = function(element,condition,action,elseAction,delay,ifCond)
{
	for (var f=0;f<Appcelerator.Compiler.customConditions.length;f++)
	{
		var condFunction = Appcelerator.Compiler.customConditions[f];
		var processed = condFunction.apply(condFunction,[element,condition,action,elseAction,delay,ifCond]);
 		if (processed)
 		{
 			return true;
 		}
 	}
 	return false;
};

Appcelerator.Compiler.parameterRE = /(.*?)\[(.*)?\]/i;
Appcelerator.Compiler.expressionRE = /^expr\((.*?)\)$/;

Appcelerator.Compiler.customActions = {};
Appcelerator.Compiler.registerCustomAction = function(name,callback)
{
	//
	// create a wrapper that will auto-publish events for each
	// action that can be subscribed to
	// 
	var action = 
	{
		build: function(id,action,params)	
		{
			var code = 'try {';
			code+=callback.build(id,action,params);
			code+='; ';
			code+='Appcelerator.Compiler.publishEvent("'+id+'","'+action+'");'; // TODO: is this needed?
			code+='}';
			code+='catch(exxx){';
			code+='Appcelerator.Compiler.handleElementException($("'+id+'"),exxx,"Executing:'+action+'");';
			code+='}';
			return code;
		}
	};
	if (callback.parseParameters)
	{
		action.parseParameters = callback.parseParameters;
	}
	Appcelerator.Compiler.customActions[name] = action;
};

Appcelerator.Compiler.properCase = function (value)
{
	return value.charAt(0).toUpperCase() + value.substring(1);
};

Appcelerator.Compiler.smartSplit = function(value,splitter)
{
	var tokens = value.split(splitter);
	if(tokens.length == 1) return tokens;
	var array = [];
	var current = null;
	for (var c=0;c<tokens.length;c++)
	{
		var line = tokens[c];
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
	var actionFunc = null;
	
	if (ifCond)
	{
		actionFunc = 'if (' + ifCond + ') { ' + Appcelerator.Compiler.makeAction(id,action,additionalParams) + ' } ';
	}
	else
	{
		actionFunc = Appcelerator.Compiler.makeAction(id,action,additionalParams);
	}
	
	return actionFunc.toFunction(true);	
};

//
// make an valid javascript function for executing the 
// action - this string must be converted to a function
// object before executing
//
Appcelerator.Compiler.makeAction = function (id,value,additionalParams)
{
	var html = '';
	var actions = Appcelerator.Compiler.smartSplit(value,' and ');
	
	for (var c=0,len=actions.length;c<len;c++)
	{
		var actionstr = actions[c].trim();
		var remote_msg = actionstr.startsWith('remote:') || actionstr.startsWith('r:');
		var local_msg = !remote_msg && (actionstr.startsWith('local:') || actionstr.startsWith('l:'));
		var actionParams = Appcelerator.Compiler.parameterRE.exec(actionstr);
		var params = actionParams!=null ? Appcelerator.Compiler.getParameters(actionParams[2],(remote_msg||local_msg)) : null;
		var action = actionParams!=null ? actionParams[1] : actionstr;

		if (local_msg || remote_msg)
		{
			params = (params || {});
			if (local_msg && params['id']==null) 
			{
			 	params['id'] = id;
			}
			if (additionalParams)
			{
				for (var p in additionalParams)
				{
					params[p] = additionalParams[p];
				}
			}
			html+='Appcelerator.Compiler.fireServiceBrokerMessage("'+id+'","'+action+'",'+Object.toJSON(params)+', this);';
		}
		else
		{
			var builder = Appcelerator.Compiler.customActions[action];
			if (!builder)
			{
				throw "syntax error: unknown action: "+action+" for "+id;
			}

			//
			// see if the widget has its own parameter parsing routine
			//
			var f = builder.parseParameters;
			
			if (f && typeof(f)=='function')
			{
				// this is called as a function to custom parse parameters in the action between brackets []
				params = f(id,action,actionParams?actionParams[2]||actionstr:actionstr);
			}

			//
			// delegate to our pluggable actions to make it easy
			// to extend the action functionality
			//
			html+=builder.build(id,action,params);
		}
		if (c+1 < len)
		{
			html+='; ';
		}
	}
	return html;
};

Appcelerator.Compiler.convertMessageType = function(type)
{
	return type.replace(/^r:/,'remote:').replace(/^l:/,'local:');
};

Appcelerator.Compiler.getMessageType = function (value)
{
	var actionParams = Appcelerator.Compiler.parameterRE.exec(value);
	return Appcelerator.Compiler.convertMessageType(actionParams && actionParams.length > 0 ? actionParams[1] : value);
};

Appcelerator.Compiler.fireServiceBrokerMessage = function (id, type, args, scopedata)
{
    setTimeout(function()
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
			data[p] = Appcelerator.Compiler.getEvaluatedValue(data[p],data,scopedata);
		}
		
		var local = type.startsWith('local:') || type.startsWith('l:');
		
		if (fieldset)
		{
			var fields = Appcelerator.Compiler.fieldSets[fieldset];
			if (fields && fields.length > 0)
			{
				for (var c=0,len=fields.length;c<len;c++)
				{
					var fieldid = fields[c];
					var field = $(fieldid);
					var name = field.name || fieldid;
					
					if (null == data[name])
					{
						// special case type field we only want to add 
						// the value if it's checked
						if (field.type == 'radio' && !field.checked)
						{
							continue;					
						}
						var newvalue = Appcelerator.Compiler.getInputFieldValue(field,true,local);
						var valuetype = typeof(newvalue);
						if (newvalue!=null && valuetype=='object' || newvalue.length > 0 || valuetype=='boolean')
						{
							data[name] = newvalue;
						}
						else
						{
							data[name] = '';
						}
					}
				}
			}
		}
		
		if (local && data['id']==null)
		{
			data['id'] = id;
		}
		
		if (!scope || scope == '*')
		{
			scope = 'appcelerator';
		}
		
		$MQ(type,data,scope);
	},0);
};


//
// return the elements value depending on the type of 
// element it is 
//
Appcelerator.Compiler.getElementValue = function (elem, dequote)
{
	elem = $(elem);
	dequote = (dequote==null) ? true : dequote;
	
	switch(Appcelerator.Compiler.getTagname(elem))
	{
		case 'input':
		{
			return Appcelerator.Compiler.getInputFieldValue(elem,true);
		}
		case 'img':
		{
			return elem.src;
		}
		case 'form':
		{
			//TODO
			return '';
		}
		default:
		{
			// allow the element to set the value otherwise use the
			// innerHTML of the component
			if (elem.value != undefined)
			{
				return elem.value;
			}
			return elem.innerHTML;
		}
	}
};

//
// get the value of the input, suitable for messaging
//
Appcelerator.Compiler.getInputFieldValue = function(elem,dequote,local)
{
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

Appcelerator.Compiler.getKeyValue = function (value)
{
	if (!value) return null;
	
	if (value.charAt(0)=='$')
	{
		return value;
	}
	else
	{
		// special syntax to allow 
		if (Appcelerator.Compiler.expressionRE.test(value))
		{
			return value;
		}
	}
	return Appcelerator.Compiler.formatValue(value,false);
};

Appcelerator.Compiler.getEvaluatedValue = function(v,data,scope)
{
	if (v && typeof(v) == 'string')
	{
		if (v.charAt(0)=='$')
		{
			var varName = v.substring(1);
			var elem = $(varName);
			if (elem)
			{
				// dynamically substitute the value
				return Appcelerator.Compiler.getElementValue(elem,true);
			}
		}
		else
		{
			// determine if this is a dynamic javascript
			// expression that needs to be executed on-the-fly
			
			var match = Appcelerator.Compiler.expressionRE.exec(v);
			if (match)
			{
				var expr = match[1];
				var func = expr.toFunction();
				return func.call(data);
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

Appcelerator.Compiler.parameterSeparatorRE = /[=:]+/;

//
// method will parse out a loosely typed json like structure
// into either an array of json objects or a json object
//
Appcelerator.Compiler.getParameters = function(str,asjson)
{
	if (str==null || str.length == 0)
	{
		return asjson ? {} : [];
	}
	// this is just a simple optimization to 
	// check and make sure we have at least a key/value
	// separator character before we continue with this
	// inefficient parser
	if (!Appcelerator.Compiler.parameterSeparatorRE.test(str))
	{
		if (asjson)
		{
			return {key:str,value:null};
		}
		else
		{
			return [{key:str,value:null}];
		}
	}
	var state = 0;
	var currentstr = '';
	var key = null;
	var data = asjson ? {} : [];
	var quotedStart = false, tickStart = false;

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
								data[key]=Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart);
							}
							else
							{
								data.push({key:key,value:Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart)});
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
			case '=':
			case ':':
			{
				switch (state)
				{
					case STATE_LOOKING_FOR_VARIABLE_END:
					{
						append = false;
						state = STATE_LOOKING_FOR_VALUE_BEGIN;
						key = currentstr.trim();
						currentstr = '';
						break;
					}
					case STATE_LOOKING_FOR_VARIABLE_VALUE_MARKER:
					{
						append = false;
						state = STATE_LOOKING_FOR_VALUE_BEGIN;
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
					case STATE_LOOKING_FOR_VALUE_END:
					{
						if (!quotedStart && !tickStart)
						{
							state = STATE_LOOKING_FOR_VARIABLE_BEGIN;
							append = false;
							if (asjson)
							{
								data[key]=Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart);
							}
							else
							{
								data.push({key:key,value:Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart)});
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
						data[key]=Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart);
					}
					else
					{
						data.push({key:key,value:Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart)});
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
				data[key]=Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart);
			}
			else
			{
				data.push({key:key,value:Appcelerator.Compiler.decodeParameterValue(currentstr,quotedStart||tickStart)});
			}
		}
	}

	return data;
};

Appcelerator.Compiler.publishEvent = function (element,event)
{
};

//
// delayed execution (if specified)
//
Appcelerator.Compiler.executeAfter = function(action,delay,scope)
{	
	var f = (scope!=null) ? function() { action.call(scope); } : action;
	
	if (delay > 0)
	{
		setTimeout(f,delay);
	}
	else
	{
		f();
	}
};

//
// generic routine for handling painting error into element upon error
//
Appcelerator.Compiler.handleElementException = function(element,e,context)
{
	var makeDiv = false;
	
	if (!element)
	{
		var id = Appcelerator.Compiler.generateId();
		new Insertion.Bottom(document.body,'<div  id="'+id+'"></div>');
		makeDiv = true;
		element = $(id);
	}
	
	var tag = element ? Appcelerator.Compiler.getTagname(element) : document.body;

	var msg = '<strong>Appcelerator Processing Error:</strong><div>Element ('+tag+') with ID: '+(element.id||element)+' has an exception: <div>'+Object.getExceptionDetail(e,true)+'</div><div>in <code>'+(context||'unknown')+'</code></div></div>';
	$E(msg);

	switch (tag)
	{
		case 'input':
		case 'textbox':
		{
			element.value = element.id;
			makeDiv=true;
			break;
		}
		case 'select':
		{
			element.options.length = 0;
			element.options[0]=new Option(element.id,element.id);
			makeDiv=true;
			break;
		}
		case 'img':
		{
			element.src = Appcelerator.ImagePath + '/warning.png';
			makeDiv=true;
			break;
		}
		case 'a':
		{
			Appcelerator.Compiler.setHTML(element,element.id);
			makeDiv=true;
			break;
		}
		case 'script':
		{
			makeDiv=true;
			break;
		}
	}
	
	if (tag.indexOf(':')>0)
	{
		makeDiv=true;
	}

	if (makeDiv)
	{
		Appcelerator.Compiler.removeElementId(id);
		Element.remove(element);
		
		var id = Appcelerator.Compiler.generateId();
		new Insertion.Bottom(document.body,'<div style="2px dotted #900"><img src="'+Appcelerator.ImagePath+'warning.png"/> <span id="'+id+'"></span></div>');
		element = $(id);
		var p = element.parentNode;
		p.style.display='block';
		p.style.visibility='visible';
		p.style.color='black';
		p.style.margin='0px auto';
		p.style.padding='5px';
		p.style.border='1px solid #c00';
		p.style.zIndex='9999';
		p.style.opacity='1.0';
		p.style.backgroundColor='#fcc';
	}
	
	Appcelerator.Compiler.setHTML(element,msg);
};

Appcelerator.Compiler.fieldSets = {};
//
// add a fieldset
//
Appcelerator.Compiler.addFieldSet = function(element,excludeSelf)
{
	excludeSelf = (excludeSelf==null) ? false : excludeSelf;
	var fieldsetName = element.getAttribute('fieldset');
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
			$D('adding = '+element.id+' to field = '+fieldsetName+', values='+Object.toJSON(fieldset));
			fieldset.push(element.id);
		}
		return fieldset;
	}
	return null;
};

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

//
// start the compile once the document is loaded - we need to run this each
// time and not just check when this file is loaded in case an external script
// decides to turn off compiling on the fly
//
Appcelerator.Util.ServerConfig.addConfigListener(function()
{
    if (Appcelerator.Compiler.compileOnLoad)
	{
		// prototype/rhino problem
		for (var name in Event.Methods) 
		{
			delete Object.prototype[name];
		}
		
        var outputHandler;
        if(Appcelerator.Compiler.isCompiledMode)
        {
            outputHandler = Appcelerator.Util.ServerConfig.outputCompiledDocument;
        }
        else
        {
            outputHandler = Prototype.K;
        }
        Appcelerator.Compiler.compileDocument(outputHandler);
	}
});

Appcelerator.Util.ServerConfig.outputCompiledDocument = function()
{
    if (Appcelerator.Compiler.isCompiledMode)
    {
        var html='';

        // add the version metadata
        var meta=window.document.createElement('meta');
        meta.setAttribute('name','generator');
        meta.setAttribute('content','Appcelerator '+Appcelerator.Version);
        Appcelerator.Core.HeadElement.appendChild(meta);

        // add the license metadata
        meta=window.document.createElement('meta');
        meta.setAttribute('name','license');
        meta.setAttribute('content',Appcelerator.LicenseMessage);
        Appcelerator.Core.HeadElement.appendChild(meta);

        var script=window.document.createElement('script');
        script.setAttribute('src','js/'+appcelerator_app_js);
        script.setAttribute('type','text/javascript');
        Appcelerator.Core.HeadElement.appendChild(script);

        var code = null;

        // set scopes for all our elements
        var codeArray = [
            'Appcelerator.Compiler.compileOnLoad=false;',
            'Appcelerator.Core.onload(function(){',
            'function setScope(id,scope){var e = $(id); if (e) e.scope = scope;}'
        ];

        for (var i in Appcelerator.Compiler.scopeMap)
        {
            var scope = Appcelerator.Compiler.scopeMap[i];
            if (typeof(scope)=='string')
            {
                codeArray.push('setScope("'+i+'","'+scope+'");');
            }
        }

        if (Appcelerator.Compiler.compiledCode)
        {
            codeArray.push(Appcelerator.Compiler.compiledCode);
        }

        codeArray.push("var attributeProcessors = Appcelerator.Compiler.attributeProcessors;");
        codeArray.push("function handleListener(elementId, attributeName, tagname, handlerIndex) {");
        codeArray.push("var element = $(elementId); var value = element.getAttribute(attributeName);");
        codeArray.push("attributeProcessors[tagname][handlerIndex][1].handle(element,attributeName,value);}");

        var listeners = Appcelerator.Compiler.compiledAttributeListeners;
        for(i = 0; i < listeners.length; i++) {
            codeArray.push('handleListener("'+listeners[i].join('","')+'");');
        }

        // close the entire onload handler
        codeArray.push('});');

        code = codeArray.join('');

        if (Appcelerator.Compiler.compressor)
        {
            // run the JS compressor (a java class)
            code = Appcelerator.Compiler.compressor.compress(code);
        }

        // remove unnecessary ids from <head>
        Appcelerator.Core.HeadElement.getElementsByTagName('*').each(function(n)
        {
            if (n.nodeType == 1 && Appcelerator.Compiler.automatedIDRegex.test(n.id))
            {
                n.removeAttribute('id');
            }
        });
        if (Appcelerator.Compiler.automatedIDRegex.test(Appcelerator.Core.HeadElement.id))
        {
            Appcelerator.Core.HeadElement.removeAttribute('id');
        }
        if (Appcelerator.Compiler.automatedIDRegex.test(Appcelerator.Core.HeadElement.parentNode.id))
        {
            Appcelerator.Core.HeadElement.parentNode.removeAttribute('id');
        }

        //
        // sweep through and figure out which CSS links are not really
        // used by the app (since we import all on compile)
        //
        var css = {};
        document.getElementsByTagName('link').each(function(link)
        {
            if (link.id)
            {
                css[link.id] = link;
            }
        });

        for (var path in Appcelerator.Core.widgets_css)
        {
            var module = Appcelerator.Core.widgets_css[path];
            if (typeof module == 'string' && Appcelerator.Core.usedModules[module])
            {
                delete css['css_'+module];
            }
        }

        for (var name in css)
        {
            if (name && typeof(name)=='string' && name.indexOf('css_')!=-1)
            {
                var link = css[name];
                link.parentNode.removeChild(link);
            }
        }

        html+=Appcelerator.Util.Dom.getText(window.document.documentElement,false,null,true,true);

		code += 'Appcelerator.Compiler.compileDocumentOnFinish();';
        Appcelerator.Compiler.compiledJS = code;
        Appcelerator.Compiler.compiledDocument = html;
    }
};


Appcelerator.Compiler.setHTML = function(element,html)
{
	$(element).innerHTML = html;
	if (Appcelerator.Browser.isIE6) setTimeout(Appcelerator.Browser.fixImageIssues,0);
};

