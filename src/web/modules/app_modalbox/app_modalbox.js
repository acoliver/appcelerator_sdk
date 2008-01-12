
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
        return [{
            name: 'on',
            optional: true,
            type: T.onExpr,
            description: "Used to show dialog"
        }, {
            name: 'title',
            optional: true,
            description: "title on the modal dialog"
        }, {
            name: 'height',
            optional: true,
            defaultValue: '90',
            type: T.naturalNumber,
            description: "height of the modal dialog in pixels"
        }, {
            name: 'width',
            optional: true,
            defaultValue: '500',
            type: T.naturalNumber,
            description: "width of the modal dialog in pixels"
        }];
    },


	execute: function(id,params,data,scope)
	{
		Modalbox.show(params['html'], {'title':params['title'],'width':params['width'],'height':params['height']});
		(function()
		{
            Appcelerator.Compiler.dynamicCompile($('MB_content'));
		}).defer(.2);
	},
	
    buildWidget: function(element,parameters)
    {
        // wrap in container in case you just specify a message, you'll get an ajax error
 		parameters['html'] = '<div>'+Appcelerator.Compiler.getHtml(element)+'</div>';
 		
		return {
			'presentation' :'' ,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : false,
			'compile':false
		};
    }
};

Appcelerator.Core.loadModuleCSS("app:modalbox","modalbox.css")
Appcelerator.Core.registerModuleWithJS('app:modalbox',Appcelerator.Module.Modalbox,["modalbox.js"]);