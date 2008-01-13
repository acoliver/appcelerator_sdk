
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
        var id = params['contentid'];

        var options = Object.extend(
        {
            beforeHide: function()
            {
               Appcelerator.Compiler.destroy($(id));
            },
            onShow: function()
            {
                Appcelerator.Compiler.dynamicCompile($(id));
            }
        },params);

		Modalbox.show(params['html'],options);
	},
	
    buildWidget: function(element,parameters)
    {
        parameters['contentid'] = element.id+'_content';
 		parameters['html'] = '<div id="'+parameters['contentid']+'">'+Appcelerator.Compiler.getHtml(element)+'</div>';
 		
 		alert(parameters['html']);
 		
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