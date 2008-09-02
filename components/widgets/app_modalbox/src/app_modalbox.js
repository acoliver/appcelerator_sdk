
/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */



Appcelerator.Widget.Modalbox =
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
        return '__VERSION__';
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
		return ['execute','close'];
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
            afterLoad: function()
            {
                Appcelerator.Compiler.dynamicCompile($(id));
            }
        },params);

		Modalbox.show(params['html'],options);
	},
	
	close: function(id,params,data,scope) 
	{
	    Modalbox.hide();
	},
	
    buildWidget: function(element,parameters)
    {
        parameters['contentid'] = element.id+'_content';
 		parameters['html'] = '<div id="'+parameters['contentid']+'">'+Appcelerator.Compiler.getHtml(element)+'</div>';
 		
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
Appcelerator.Widget.registerWithJS('app:modalbox',Appcelerator.Widget.Modalbox,["modalbox.js", "patch.js"]);
