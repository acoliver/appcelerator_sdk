
Appcelerator.Module.Rest =
{
	getName: function()
	{
		return 'appcelerator rest';
	},
	getDescription: function()
	{
		return 'rest widget';
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
		return 'Hamed Hashemi';
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
		return 'app:rest';
	},
	getAttributes: function()
	{
		return [{name: 'on', optional: false, description: "Used to execute posts/gets"},
				{name: 'response', optional: true, description: "Response message when success"},
				{name: 'error', optional: true, description: "Message to fire when errors received"}];
	},
	getActions: function()
	{
		return ['post', 'get'];
	},
	post: function(id,params,data,scope,version)
	{
		Appcelerator.Module.Rest.performFetch(params, data, 'post');
	},
	get: function(id,params,data,scope,version)
	{
		Appcelerator.Module.Rest.performFetch(params, data, 'get');
	},
	performFetch: function(params, data, method)
	{
		var uri = params['uri'][method];
		var response = uri['response'] || params['response'];
		var error = uri['error'] || params['error'];

		var property = uri['property'];
		var methodParams = uri['args'];
		if (!methodParams && property)
		{
	 		var array = Object.getNestedProperty(data,property);
			if (array)
			{
				methodParams = Object.toJSON(array[0]);
			}
		}
		
		var compiled = eval(uri['uri'] + '; init_'+params['id']);
		var uriLink = compiled(data);
		
		if (uriLink.startsWith('http://'))
		{
			var uriStrip = uriLink.match('http://[^/]*');
			var currentStrip = window.location.href.match('http://[^/]*');
			
			if (uriStrip[0].toLowerCase() != currentStrip[0].toLowerCase())
			{
				var proxy = Appcelerator.ServerConfig['proxy'];
				if (proxy)
				{
					uriLink = proxy.value + '?'+ uriLink;
				}
			}
		}

		$D('app:rest sending request to ' + uriLink + ' with params '  + methodParams);
		new Ajax.Request(uriLink,
		{
			method: method,
			parameters: methodParams,
			onSuccess: function (result)
			{
				contentType = result.getResponseHeader('Content-Type');
				if (result.status == 200)
                {
					var json_result = {};
                    $D('app:rest onSuccess doing ' + method + ' to ' + uriLink + ', status = ' + result.status + ', contentType = ' + contentType + ', text = '+ result.responseText);

					if (contentType.indexOf('/xml') > 0)
					{
						json_encode_xml(result.responseXML.documentElement, json_result);
					}
					else if (contentType.indexOf('/json') > 0)
					{
						json_result = result.responseText.evalJSON();
					}
					else
					{
						$E('app: rest onSuccess received invalid content type = ' + contentType);
						return;
					}
					if (response)
					{
						$MQ(response, json_result);
					}
				}
			},
			onException: function (resp, ex)
			{
				var msg = new String(ex);
				$E('app:rest onException doing ' + method + ' to ' + msg);
				if (error)
				{
					$MQ(error, {msg: msg});
				}
			},
            onFailure: function (result, json)
			{
				$E('app:rest onFailure doing ' + method + ' to ' + uriLink + ', status = ' + result.status + ', text = ' + result.statusText);
				if (error)
				{
					$MQ(error, {msg: result.statusText});
				}
			}
		});
	},
	buildWidget: function(element,parameters)
	{
		var uris = {};
		
		if (Appcelerator.Browser.isIE)
		{
			// NOTE: in IE, you have to append with namespace
			var newhtml = element.innerHTML;
			newhtml = newhtml.replace(/<URI/g,'<APP:URI').replace(/\/URI>/g,'/APP:URI>');
			element.innerHTML = newhtml;
		}
		
		for (var c=0; c<element.childNodes.length; c++)
		{
			(function()
			{
				var node = element.childNodes[c];
				if (node.nodeType == 1 && node.nodeName == 'URI')
				{
					uriLink = Appcelerator.Compiler.compileTemplate(node.getAttribute('uri'),true,'init_'+element.id);
					var uri = {uri: uriLink, response: node.getAttribute('response'), args: node.getAttribute('args'), property: node.getAttribute('property'), error: node.getAttribute('error')};
					uris[node.getAttribute('method')] = uri;
				}
			})();
		}
		
		parameters['uri'] = uris;

		return {
			'presentation' : '',
			'position' : Appcelerator.Compiler.POSITION_REPLACE
		};
	}
};

Appcelerator.Core.registerModule('app:rest',Appcelerator.Module.Rest);