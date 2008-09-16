Appcelerator.ServerConfig = {};

Appcelerator.Util.ServerConfig = Class.create();
Appcelerator.Util.ServerConfig.listeners = [];

Appcelerator.Util.ServerConfig.addConfigListener = function(listener)
{
	if (Appcelerator.Util.ServerConfig.listeners)
	{
		Appcelerator.Util.ServerConfig.listeners.push(listener);
	}
	else
	{
		listener();
	}
};

/**
 * if this value is set, we will not auto fetch the appcelerator.xml
 * and you will need to call Appcelerator.Util.ServerConfig.set 
 * programatically
 */
Appcelerator.Util.ServerConfig.disableRemoteConfig = false;

/**
 * call this function when you want to manually configure the server
 * config from javascript vs. fetching automatically from AJAX request
 */
Appcelerator.Util.ServerConfig.set = function(config)
{
    Appcelerator.ServerConfig = config;
    Appcelerator.Util.ServerConfig.loadComplete();
};

Appcelerator.Util.ServerConfig.load = function()
{
	if (window.location.href.indexOf('file:/')==-1)
	{
	    if (Appcelerator.Util.ServerConfig.disableRemoteConfig)
	    {
	       return;
	    }
		var xmlPath = Appcelerator.DocumentPath + 'appcelerator.xml';
			
		new Ajax.Request(xmlPath,
		{
		 	asynchronous: true,
		    method: 'get',
			onSuccess:function (resp)
			{
				var xml = resp.responseXML.documentElement;
				var children = xml.childNodes;
				for (var c=0;c<children.length;c++)
				{
					var child = children[c];
					if (child.nodeType == Appcelerator.Util.Dom.ELEMENT_NODE)
					{
						var service = child.nodeName.toLowerCase();
						var config = {};
						var path = Appcelerator.Util.Dom.getText(child);
						var template = new Template(path,/(^|.|\r|\n)(@\{(.*?)\})/);
						config.path = template.evaluate(Appcelerator.TEMPLATE_VARS);
						// keep path for backwards compatability
						config.value = config.path;
						Appcelerator.Util.Dom.eachAttribute(child,function(k,v)
						{
							config[k]=v;
						},['id'],true);
						Appcelerator.ServerConfig[service] = config;
					}
				}
				Appcelerator.Util.ServerConfig.loadComplete();
			},
			onFailure:function(r)
			{
				$E('Failed to load configuration from '+xmlPath);
				Appcelerator.Util.ServerConfig.loadComplete();
			}
		});
	}
	else
	{
		Appcelerator.Util.ServerConfig.loadComplete();
	}
};

Appcelerator.Util.ServerConfig.loadComplete = function()
{
	Appcelerator.Util.ServerConfig.listeners.each (function(l)
	{	
		try 
		{
			l();
		}
		catch (e)
		{
			$E('error calling server config listener = '+l+', Exception = '+Object.getExceptionDetail(e));
		}
	});
	Appcelerator.Util.ServerConfig.listeners = null;
};

Appcelerator.Util.ServerConfig.addConfigListener(function ()
{
	Appcelerator.Browser.autocheckBrowserSupport = Appcelerator.Config['browser_check'];
	Appcelerator.Browser.autoReportStats = Appcelerator.Config['report_stats'];
});

Appcelerator.Util.ServerConfig.setValues = function(key, def)
{
    if (Appcelerator.ServerConfig[key])
    {
        Appcelerator.Config[key] = Appcelerator.ServerConfig[key].value;
    }
    else if (Appcelerator.Parameters.get(key))
    {
        var param = Appcelerator.Parameters.get(key);
        switch (param)
        {
            case 'true':
            {
                Appcelerator.Config[key] = true;
                break;
            }
            case 'false':
            {
                Appcelerator.Config[key] = false;
                break;
            }
            default:
            {
                Appcelerator.Config[key] = Appcelerator.Parameters.get(key);
            }
        }
    }
    else
    {
        Appcelerator.Config[key] = def;
    }
}

// allow the user to override our defaults
if (window.AppceleratorConfig)
{
	for (var key in window.AppceleratorConfig)
	{
		var value = window.AppceleratorConfig[key];
		Appcelerator.Util.ServerConfig.setValues(key,value);
	}
}
Appcelerator.Util.ServerConfig.setValues('cookie_check', true);
Appcelerator.Util.ServerConfig.setValues('browser_check', true);
Appcelerator.Util.ServerConfig.setValues('hide_body', false);
Appcelerator.Util.ServerConfig.setValues('perfmon', false);
Appcelerator.Util.ServerConfig.setValues('usegears', true);
Appcelerator.Util.ServerConfig.setValues('report_stats', true);
Appcelerator.Util.ServerConfig.setValues('track_stats', true);

Appcelerator.Core.onload(Appcelerator.Util.ServerConfig.load);
