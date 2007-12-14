
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
	getSpecVersion: function()
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
	getActions: function()
	{
		return ['execute'];
	},	
	getAttributes: function()
	{
		return [{name: 'on', optional: true, description: "May be used to execute/load the content."},
				{name: 'src', optional: false, description: "The source for the content file to load."},
				{name: 'args', optional: true, description: "Used to replace text in the content file."},
				{name: 'lazy', optional: true, defaultValue: 'false', description: "Indicates whether the content file should be lazy loaded."},
				{name: 'reload', optional: true, defaultValue: 'false', description: "Indicates whether the content file should be refetched and reloaded on every execute. If false, execute will do nothing if already executed."},
				{name: 'onload', optional: true, description: "Fire this message when content file is loaded."},
				{name: 'onfetch', optional: true, description: "Fire this message when content file is fetched but before being loaded."}];
	},	
	execute: function(id,parameterMap,data,scope)
	{
		if (!parameterMap['reload'])
		{
			if (!$(id).fetched && !parameterMap['fetched'])
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
	compileWidget: function(parameters)
	{
		if (!(parameters['lazy'] == 'true'))
		{
			Appcelerator.Module.Content.fetch(parameters['id'],parameters['src'],parameters['args'],parameters['onload'],parameters['onfetch']);
			parameters['fetched'] = true;
		}
	},
	buildWidget: function(element,parameters,state)
	{
		parameters['reload'] = (parameters['reload'] == 'true');
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : '',
			'compile' : true
		};
	},
	fetch: function (target,src,args,onload,onfetch)
	{
        target = $(target);
        target.style.visibility='hidden';

		Appcelerator.Util.IFrame.fetch(src,function(doc)
		{
			if (onfetch)
			{
				$MQ(onfetch,{'src':src,'args':args});
			}
			
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
			target.innerHTML = html;
			state.onafterfinish=function()
			{
				 // turn it back on once we're done compiling
			     target.style.visibility='visible';
	             if (onload)
	             {
	                $MQ(onload,{'src':src,'args':args});
	             }
			};
			Appcelerator.Compiler.compileElement(target.firstChild,state,false);
			state.scanned=true;
			Appcelerator.Compiler.checkLoadState(state);
		},true,true);
	}
};

Appcelerator.Core.registerModule('app:content',Appcelerator.Module.Content);