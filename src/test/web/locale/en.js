var my_lang_bundle = 
{
	'my.lang.key': 'Test Passed',
	'my.format.key': 'Test : #{result}',
	'my.dropdown': 
	[
		{id:'',value:'Test Passed - check below for values'},
		{id:'Jr.',value:'Jr.'},
		{id:'Sr.',value:'Sr.'},
		{id:'I',value:'I'},
		{id:'II',value:'II'},
		{id:'III',value:'III'},
		{id:'IV',value:'IV'}
	],
	'my.option':{'id':'test',value:'Test Passed'}
};

Appcelerator.Localization.addLanguageBundle('en','English',$H(my_lang_bundle));

