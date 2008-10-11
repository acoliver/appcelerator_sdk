//
// support for dynamically loading plugins as they 
// are invoked as a plugin stub
//
var loadedPlugins = {};
var dynamicPlugins = 
{
	'example':null
};


function installDynPlugin(name,fn)
{
	var l = loadedPlugins[name];
	if (l) return fn();
	var path = AppC.pluginRoot+name+'.js';
	$.getScript(path,function()
	{
		loadedPlugins[name]=1;
		fn();
	});
};

for (var name in dynamicPlugins)
{
	(function()
	{
		var found = $.fn[name];
		// allow them to be pre-loaded (such as in <script>) and in this
		// case, we assume it's already loaded and doesn't need this at all
		if (typeof(found)=='function') return;
		$.fn[name]=function()
		{
			var arguments = arguments;
			var scope = this;

			var depends = dynamicPlugins[name] || [];
			depends.push(name);
			var length = depends.length;
			var count = 0;

			var f = function()
			{
				var n = depends[count];
				if (count++ < length)
				{
					installDynPlugin(n,f);
				}
				else
				{
					// at this point, the plugin should have installed itself over top of us
					// so we can now invoke it
					$.fn[name].apply(scope,arguments);
				}
			};

			f();

			return this;
		}
	})();
}
