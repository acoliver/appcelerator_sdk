
Appcelerator.Module.ProgressBar =
{
	getName: function()
	{
		return 'appcelerator progressbar';
	},
	getDescription: function()
	{
		return 'progressbar widget';
	},
	setPath: function(path)
	{
		this.modulePath = path;
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
		return 'Martin Robinson';
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
		return 'app:progressbar';
	},
	execute: function(id,parameterMap,data,scope)
	{

	},
	compileWidget: function(params)
	{
		var id = params['id'];
		var animate = params['animate'];
		var element = $(id);
		
		var progressbar_border = $(id+'_progressbar_border');
		var progressbar_fill = $(id+'_progressbar_fill');
		
		Appcelerator.Compiler.addTrash(element,function()
		{
		});

		var message = params['message'];
		if (message)
		{
			message = Appcelerator.Compiler.convertMessageType(message);

			var property = params['property'];
			var listener = 
			{
				accept: function()
				{
					return [message];
				},
				acceptScope: function(scope)
				{
					return element.scope=='*' || element.scope==scope;
				},
				onMessage: function (t, data, datatype, direction)
				{
					try
					{
						$D('received message = '+direction+':'+t+',data='+Object.toJSON(data));
						var value = property ? Object.getNestedProperty(data,property) : data;
                        value = Math.max(0, value);
                        value = Math.min(100, value);

                        if (animate == 'true') {
                            $(id+'_progressbar_fill').morph('width: ' + value + '%');
                        } else {
						    progressbar_fill.style.width = value + "%";
                        }
					}
					catch(e)
					{
						Appcelerator.Compiler.handleElementException(element,e);
					}
				}
			};

			Appcelerator.Util.ServiceBroker.addListener(listener);
		}		
	},
	getAttributes: function()
	{
		return [{name: 'borderClassName', optional: true, defaultValue: ''},
				{name: 'fillClassName', optional: true, defaultValue: ''},
				{name: 'width', optional: true, defaultValue: '500px'},
				{name: 'height', optional: true, defaultValue: '30px'},
				{name: 'message', optional: true},
				{name: 'property', optional: true},
				{name: 'animate', optional: true, defaultValue: 'true'}];
	},	
	buildWidget: function(element, parameters)
	{
		var borderClassName = parameters['borderClassName'];
		var fillClassName = parameters['fillClassName'];
		var width = parameters['width'];
		var height = parameters['height'];
		var id = element.id;

		var html = '';

		var borderstyle = '"width: ' + width + '; height: ' + height + '"';
		var borderid = '"' + id + '_progressbar_border"';
		html += '<div style=' + borderstyle + ' id=' + borderid;

		if (borderClassName != '') {
			html += ' class="' + borderClassName + '">';
        } else {
			html += ' class="progressbar_border">'
        }

		var fillstyle = '"height: 100%; width: 0%;"';
		var fillid = '"' + id + '_progressbar_fill"';
		html += '<div style=' + fillstyle + ' id=' + fillid;

		if (fillClassName != '') {
			html += ' class="' + fillClassName + '">';
        } else {
			html += ' class="progressbar_fill">';
        }

		html += '</div></div>';
		
		parameters['id'] = element.id;
		
		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'compile' : true,
			'wire' : true
		};
	}
};


Appcelerator.Core.registerModule('app:progressbar',Appcelerator.Module.ProgressBar);
Appcelerator.Core.loadModuleCSS('app:progressbar','progressbar.css');
