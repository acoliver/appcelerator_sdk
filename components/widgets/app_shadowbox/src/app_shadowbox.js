
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



Appcelerator.Widget.Shadowbox =
{
    getName: function()
    {
        return 'appcelerator shadowbox';
    },
    getDescription: function()
    {
        return 'The shadowbox widget wraps the Shadowbox library available at http://mjijackson.com/shadowbox/doc/usage.html';
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
        return 'Hamed Hashemi';
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
        return 'app:shadowbox';
    },
	getActions: function()
	{
		return ['execute'];
	},	
    getAttributes: function()
    {
		var T = Appcelerator.Types;        
        return [{
            name: 'src',
            optional: false,
            description: "target src for the shadowbox"
        }, {
            name: 'title',
            optional: true,
            description: "title on the shadowbox"
        }, {
            name: 'options',
            optional: true,
            description: "options on the shadowbox"
        }];
    },
	execute: function(id,params,data,scope)
	{

	},
	compileWidget: function(params)
	{
		Shadowbox.setup($(params['id']),params['options']);
	},
    buildWidget: function(element,parameters)
    {
        if (!parameters['options'])
        {
            parameters['options'] = {};
        }
        else
        {
            parameters['options'] = parameters['options'].evalJSON();
        }
		parameters['options']['skipSetup'] = true;
		parameters['options']['loadingImage'] = Appcelerator.WidgetPath + 'app_shadowbox/images/loading.gif';
	    parameters['options']['overlayBgImage'] = Appcelerator.WidgetPath + 'app_shadowbox/images/overlay-85.png';

		Shadowbox.init(parameters['options']);
		
		html = '<a href="'+parameters['src']+'" id="'+parameters['id']+'">';
		html += Appcelerator.Compiler.getHtml(element);
		html += '</a>';

		return {
			'presentation' : html,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : true,
			'compile':true
		};
    }
};

Appcelerator.Widget.loadWidgetCSS("app:shadowbox","shadowbox.css")
Appcelerator.Widget.registerWithJS('app:shadowbox',Appcelerator.Widget.Shadowbox,["shadowbox-prototype.js", "shadowbox.js"]);
