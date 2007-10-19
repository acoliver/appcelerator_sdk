
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
		Appcelerator.Module.Content.fetch(id,parameterMap['src'],parameterMap['args']);
	},
	buildWidget: function(element,state)
	{
		var jscode = '';
		
		var on = element.getAttribute('on');
		var src = element.getAttribute('src');
		var lazy = (element.getAttribute('lazy') || 'false' ) == 'true';
		var args = element.getAttribute('args');
		
		args = (args) ? '"'+args+'"' : 'null';
		
		jscode+='$("'+element.id+'").scope = "'+element.scope+'";';
		jscode+=Appcelerator.Compiler.getJSCode(Appcelerator.Compiler.parseOnAttribute(element));
		if (!lazy)
		{
			jscode+='Appcelerator.Module.Content.fetch("'+element.id+'","'+src+'",'+args+');';
		}
		var parameters = {};
		parameters['src'] = src;
		parameters['args'] = args;
	
		var f = on ? ['execute'] : null;
	
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : '',
			'initialization':  jscode,
			'parameters': parameters,
			'functions': f
		};
	},
	fetch: function (target,src,args)
	{
		Appcelerator.Util.IFrame.fetch(src,function(doc)
		{
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
		});
	}
};

Appcelerator.Core.registerModule('app:content',Appcelerator.Module.Content);