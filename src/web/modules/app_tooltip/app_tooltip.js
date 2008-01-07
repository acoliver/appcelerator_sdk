
Appcelerator.Module.Tooltip =
{
    getName: function()
    {
        return 'appcelerator tooltip';
    },
    getDescription: function()
    {
        return 'tooltip widget';
    },
    getVersion: function()
    {
        return 1.1;
    },
    getSpecVersion: function()
    {
        return 1.0;
    },
    getAuthor: function()
    {
        return 'Nolan Wright';
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
        return 'app:tooltip';
    },
    getAttributes: function()
    {
        return [
                {name: 'element', optional: false, description: "element for tooltip"},
                {name: 'backgroundColor', optional: true, defaultValue:'#FC9', description: "background color of tooltip"},
               	{name: 'borderColor', optional: true, defaultValue:'#c96', description: "border color of tooltip"},
               	{name: 'mouseFollow', optional: true, defaultValue:true, description: "should tip follow mouse"},
               	{name: 'opacity', optional: true, defaultValue:'.99', description: "tooltip opacity"},
                {name: 'textColor', optional: true, defaultValue:'#111', description: "text color of tooltip"}];
    },

	compileWidget: function(parameters)
	{
		var mouseFollow = (parameters['mouseFollow']=="true")?true:false;
		var tip = new Tooltip($(parameters['element']), 
			{ backgroundColor:parameters['backgroundColor'],
			  borderColor:parameters['borderColor'],
			  textColor:parameters['textColor'],
			  mouseFollow:mouseFollow,
			  opacity:parameters['opacity']
			
			});
		tip.content = parameters['html'];
	},
    buildWidget: function(element,parameters)
    {
 		parameters['html'] = Appcelerator.Compiler.getHtml(element);
		return {
			'presentation' :'' ,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : false,
			'compile':true
		};
    }
};

Appcelerator.Core.loadModuleCSS("app:tooltip","tooltips.css")
Appcelerator.Core.registerModuleWithJS('app:tooltip',Appcelerator.Module.Tooltip,['builder.js','tooltips.js']);