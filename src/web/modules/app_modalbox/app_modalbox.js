
Appcelerator.Module.Modalbox =
{
    getName: function()
    {
        return 'appcelerator modalbox';
    },
    getDescription: function()
    {
        return 'modal dialog box widget';
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
        return 'app:modalbox';
    },
	getActions: function()
	{
		return ['execute'];
	},	

    getAttributes: function()
    {
		var T = Appcelerator.Types;
        return [{name: 'on', optional: true, type: T.onExpr,
		         description: "Used to show dialog"},
                {name: 'title', optional: true, description: "title on the modal dialog"},
                {name: 'height', optional: true, defaultValue:'90', type: T.cssDimension,
				 description: "height of the modal dialog"},
                {name: 'width', optional: true, defaultValue:'500', type: T.cssDimension, 
				 description: "width of the modal dialog"}];
    },


	execute: function(id,params,data,scope)
	{
		Modalbox.show(params['html'], {'title':params['title'],'width':params['width'],'height':params['height']});
		setTimeout(function()
		{
			Appcelerator.Compiler.dynamicCompile($('MB_content'));
		},1000);
		
	},
    buildWidget: function(element,parameters)
    {
 		parameters['html'] = Appcelerator.Compiler.getHtml(element);
		return {
			'presentation' :'' ,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : true,
			'compile':false
		};
    }
};

Appcelerator.Core.loadModuleCSS("app:modalbox","modalbox.css")
Appcelerator.Core.registerModuleWithJS('app:modalbox',Appcelerator.Module.Modalbox,["modalbox.js"]);