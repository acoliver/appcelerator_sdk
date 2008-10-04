
AppC.currentLocale = window.navigator.language || 'en';
var bundles = {};

//
// called to dynamically load a language locale.
//
// the path of the bundle is:
//
// AppC.docRoot + 'localization/' + locale.properties
//
// will attempt to load specific locale is fully specified (such as en-UK)
// and will attempt to fall back to short version (such as en) if not found
//
AppC.locale = function(lang)
{
	if (lang==AppC.currentLocale)
	{
		return;
	}
	AppC.currentLocale = lang;
	if (!bundles[lang])
	{
		try
		{
			var url = AppC.docRoot + 'localization/' + lang.toLowerCase() + '.properties';
			$.debug('attempting to fetch '+url);

			$.ajax({
				url: url,
				cache:true,
				dataType: 'text',
				type: 'GET',
				async:true,
				success:function(prop)
				{
					var endRE = /\\$/;
					var cont = false, key = null, value = null;
					var map = {};
					$.each(prop.split("\n"),function()
					{
						if (cont)
						{
							value+=value.substring(0,value.length-1);
							if (endRE.test(this))
							{
								return;
							}
							map[key]=value;
							cont=false;
							key=value=null;
							return;
						}
						var line = $.trim(this);
						if (line == '' || line.charAt(0)=='#')
						{
							return;
						}
						var tokens = line.split('=');
						var k = $.trim(tokens[0]);
						if (k.charAt(0)=='#') return;
						var v = $.trim(tokens.length > 1 ? tokens[1] : '');
						if (endRE.test(v))
						{
							cont = true;
							key = k;
							value = v.substring(0,v.length-1);
							return;
						}
						map[k]=v;
					});
					bundles[lang]=map;
					AppC.beforeCompile(function()
					{
						$('[@id]').localize(lang);
					});
					$(document).trigger('localized',lang);
				}
			});
		}
		catch (E)
		{
			if (lang.indexOf('-') > 0)
			{
				// if you specify en-US, fall back to just en if not found
				return AppC.locale(lang.split('-')[0]);
			}
			$.error('error loading language bundle for language = '+lang+', Exception = '+E);
		}
	}
	else
	{
		AppC.beforeCompile(function()
		{
			$('[@id]').localize(lang);
		});
		$(document).trigger('localized',lang);
	}
}

//
// plugin to localize one or more elements for a given language (or the default if not passed)
//
$.fn.localize = function(lang)
{
	if (this.length > 1)
	{
		$.each(this,function(){
			$(this).localize(lang);
		});
		return this;
	}
	var id = $(this).attr('id');
	if (id != null)
	{
		var m = bundles[lang||AppC.currentLocale];
		if (m)
		{
			var value = m[id];
			if (value)
			{
				var el = $(this).get(0);
				switch(el.nodeName)
				{
					//FIXME - support more obvious types
					case 'INPUT':
					case 'BUTTON':
					{
						$(this).val(value);
						break;
					}
					default:
					{
						$(this).html(value);
						break;
					}
				}
			}
		}
	}
	return this;
};


//
// if set, will attempt to auto load the localization bundle based on the users locale setting
//
if (AppC.config.auto_locale)
{
	AppC.locale(locale);	
}
