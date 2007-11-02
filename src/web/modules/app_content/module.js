
Appcelerator.Module.Content =
{
	getName: function()
	{
		return 'appcelerator content';
	},
	getDescription: function()
	{
		return 'content widget';
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
		return 'app:content';
	},
	execute: function(id,parameterMap,data,scope)
	{
		if (!parameterMap['reload'])
		{
			if (!$(id).fetched)
			{
				Appcelerator.Module.Content.fetch(id,parameterMap['src'],parameterMap['args'],parameterMap['onload'],parameterMap['onfetch']);
				$(id).fetched = true;
			}
		}
		else
		{
			Appcelerator.Module.Content.fetch(id,parameterMap['src'],parameterMap['args'],parameterMap['onload'],parameterMap['onfetch']);
		}
	},
	buildWidget: function(element,state)
	{
		var jscode = '';
		
		var on = element.getAttribute('on');
		var src = element.getAttribute('src');
		var lazy = (element.getAttribute('lazy') || 'false' ) == 'true';
		var args = element.getAttribute('args');
		var onload = element.getAttribute('onload');
		var onfetch = element.getAttribute('onfetch');		
		var reload = (element.getAttribute('reload') || 'false') == 'true';
		
		var parameters = {};
		parameters['onload'] = onload;		
		parameters['onfetch'] = onfetch;		
		parameters['src'] = src;
		parameters['args'] = args;
		parameters['reload'] = reload;

		args = (args) ? '"'+args+'"' : 'null';
		onload = (onload) ? '"'+onload+'"' : 'null';
		onfetch = (onfetch) ? '"'+onfetch+'"' : 'null';		
		
		jscode+='$("'+element.id+'").scope = "'+element.scope+'";';
		jscode+=Appcelerator.Compiler.getJSCode(Appcelerator.Compiler.parseOnAttribute(element));
		if (!lazy)
		{
			jscode+='Appcelerator.Module.Content.fetch("'+element.id+'","'+src+'",'+args+','+onload+','+onfetch+');';
			jscode+='$("'+element.id+'").fetched = true';
		}
	
		var f = on ? ['execute'] : null;
	
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : '',
			'initialization':  jscode,
			'parameters': parameters,
			'functions': f
		};
	},
	fetch: function (target,src,args,onload,onfetch)
	{
		Appcelerator.Util.IFrame.fetch(src,function(doc)
		{
			if (onfetch)
			{
				$MQ(onfetch,{'src':src,'args':args});
			}
			
			target = $(target);
			var scope = target.getAttribute('scope') || target.scope;
			doc.setAttribute('scope',scope);
			doc.scope = scope;
			Appcelerator.Compiler.getAndEnsureId(doc);
			var state = Appcelerator.Compiler.createCompilerState();
			var html = '<div>'+doc.innerHTML+'</div>';
			if (args)
			{
				// replace tokens in our HTML with our args
				var t = Appcelerator.Compiler.compileTemplate(html);
				html = t(args.evalJSON());
			}
			// turn off until we're done compiling
			target.style.visibility='hidden';
			target.innerHTML = html;
			state.onafterfinish=function()
			{
				// turn it back on once we're done compiling
			     target.style.visibility='visible';
			};
			Appcelerator.Compiler.compileElement(target.firstChild,state,false);
			state.scanned=true;
			Appcelerator.Compiler.checkLoadState(state);
			
			if (onload)
			{
				$MQ(onload,{'src':src,'args':args});
			}
		},true,true);
	}
};

Appcelerator.Core.registerModule('app:content',Appcelerator.Module.Content);