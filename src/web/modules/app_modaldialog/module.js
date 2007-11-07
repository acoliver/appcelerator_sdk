
Appcelerator.Module.Modaldialog =
{
	getName: function()
	{
		return 'appcelerator modaldialog';
	},
	getDescription: function()
	{
		return 'modaldialog widget';
	},
	getVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Jeff Haynie';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:modaldialog';
	},
	execute: function(id,parameterMap,data,scope)
	{
		var compiled = parameterMap['compiled'];
		var propertyName = parameterMap['property'];
		var array = null;
		
		if (!compiled)
		{
			compiled = eval(parameterMap['template'] + '; init_'+id);
			parameterMap['compiled'] = compiled;
		}
		
		if (propertyName)
		{ 
			array = Object.getNestedProperty(data,propertyName) || [];
		}
		
		var html = '';
		if (!array || array.length == 0)
		{
			html = compiled(data);
		}
		else
		{
			html = compiled(array[0]);
		}
		
		html = '<div scope="' + (scope || element.scope) + '">' + html + '</div>';
		
		var overlay = $('overlay');
		var overlaydata = $('overlay_data');
		
		overlaydata.innerHTML = html;

		Appcelerator.Compiler.dynamicCompile(overlaydata);
		
		var arrayPageSize = Element.getDocumentSize();
		overlay.style.height = arrayPageSize[3] + 250 + 'px';
		Element.show(overlay);

		var dataTop = 0;
		if (!parameterMap['top'])
		{
			var arrayPageScroll = Element.getPageScroll();
			var dataTop = Math.min(80,arrayPageScroll + (arrayPageSize[3] / 5));
			Logger.debug('modaldialog: dataTop='+dataTop+',arrayPageScroll='+arrayPageScroll+',arrayPageSize[3]='+arrayPageSize[3]);
		}
		else
		{
			dataTop = parseInt(parameterMap['top']);
		}
		overlaydata.style.top = dataTop + 'px';
		Element.show(overlaydata);
	},
	buildWidget: function(element,state)
	{
		var hidemessage = 'l:appcelerator.modaldialog.hide';

		var overlay = $('overlay');
		if (!overlay)
		{
			var overlayHtml = '<div id="overlay" style="display: none" on="' + hidemessage + ' then hide" scope="*"></div>';
			new Insertion.Bottom(document.body, overlayHtml);
			overlay = $('overlay');
			overlay.modaldialog_compiled = 1;
			Appcelerator.Compiler.compileElement(overlay,state);
		}
		else
		{
			// allow overlay to be added in the doc but we attach to it
			if (!overlay.modaldialog_compiled)
			{
				overlay.setAttribute('scope','*');
				overlay.setAttribute('on',hidemessage+' then hide');
				Appcelerator.Compiler.compileElement(overlay,state);
				overlay.modaldialog_compiled = 1;
			}
		}
		
		var overlaydata = $('overlay_data');
		if (!overlaydata)
		{
			var overlayDataHtml = '<div on="' + hidemessage + ' then hide" class="overlay_data" id="overlay_data" style="display: none" scope="*"></div>'
			new Insertion.Bottom(document.body, overlayDataHtml);
			overlaydata = $('overlay_data');
			Appcelerator.Compiler.compileElement(overlaydata,state);
		}
		
		var parameters = {};
		parameters['template'] = Appcelerator.Compiler.compileTemplate(Appcelerator.Compiler.getWidgetHTML(element),true,'init_'+element.id);
		parameters['property'] = element.getAttribute('property');
		parameters['top'] = element.getAttribute('top');
		
		Appcelerator.Compiler.parseOnAttribute(element);	
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REMOVE,
			'functions' : ['execute'],
			'parameters': parameters
		};
	}
};

Appcelerator.Core.registerModule('app:modaldialog',Appcelerator.Module.Modaldialog);
Appcelerator.Core.loadModuleCSS('app:modaldialog','modaldialog.css');