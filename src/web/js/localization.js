Appcelerator.Localization = Class.create();

Appcelerator.Localization.currentLanguage = 'en';
Appcelerator.Localization.LanguageMap = {};

//
// add a language bundle, replacing an existing on if found
// the map should be the 
//
Appcelerator.Localization.addLanguageBundle = function(lang,displayName,map)
{
	Appcelerator.Localization.LanguageMap['language_'+lang] = {map:map,display:displayName};
};

//
// get an array of languages. the entry in the array is an
// object with two properties:
// 
// - id - the language code (such as "en")
// - name - the registered language name such as "English"
// 
//
Appcelerator.Localization.getLanguages = function()
{
	var langs = [];
	
	for (var key in Appcelerator.Localization.LanguageMap)
	{
		if (key.startsWith('language_'))
		{
			langs.push({
				id:key.substring(9),
				name:Appcelerator.Localization.LanguageMap[key].display
			});
		}
	}
	return langs;
};

//
// set a language bundle key for a given language - the language
// bundle must have already been registered or an exception will be raised
//
Appcelerator.Localization.set = function(key,value,lang)
{
	lang = (lang==null) ? Appcelerator.Localization.currentLanguage : lang;
	var map = Appcelerator.Localization.LanguageMap['language_'+lang];
	if (!map)
	{
		throw "language bundle not found for language: "+lang;
	}
	map[key]=value;
}

//
// get a language bundle key value or return defValue if not found
//
Appcelerator.Localization.get = function(key,defValue,lang)
{
	lang = (lang==null) ? Appcelerator.Localization.currentLanguage : lang;
	
	var map = Appcelerator.Localization.LanguageMap['language_'+lang];
	
	if (map && map.map)
	{
		return map.map[key] || defValue;
	}
	return defValue;
};

Appcelerator.Localization.compiledTemplates = {};

//
// get a language bundle string that is formatted by using args as a json
// array where each key in the template is in the format #{keyname}
//
Appcelerator.Localization.getWithFormat = function (key, defValue, lang, args)
{
	lang = (lang==null) ? Appcelerator.Localization.currentLanguage : lang;
	var cacheKey = key + ':' + lang;
	var cachedCopy = Appcelerator.Localization.compiledTemplates[cacheKey];
	if (!cachedCopy)
	{
		var template = Appcelerator.Localization.get(key,defValue,lang);
		cachedCopy = Appcelerator.Compiler.compileTemplate(template);
		Appcelerator.Localization.compiledTemplates[cacheKey]=cachedCopy;
	}
	return cachedCopy.call(cachedCopy,args);
};


//
// default supported tags that can be localized
//
Appcelerator.Localization.supportedTags = 
[
	'div',
	'span',
	'input',
	'a',
	'td',
	'select',
	'option',
	'li',
	'h1',
	'h2',
	'h3',
	'h4',
	'ol',
	'legend'
];

//
// register a supported tag
//
Appcelerator.Localization.registerTag = function(tag)
{
	if (Appcelerator.Localization.supportedTags.indexOf(tag)==-1)
	{
		Appcelerator.Localization.supportedTags.push(tag);
	}
};

//
// unregister a supported tag
//
Appcelerator.Localization.unregisterTag = function(tag)
{
	var i = Appcelerator.Localization.supportedTags.indexOf(tag);
	if (i!=-1)
	{
		Appcelerator.Localization.supportedTags.removeAt(i);
	}
};


// 
// create the default english bundle and make it empty
//
Appcelerator.Localization.addLanguageBundle('en','English',{});

