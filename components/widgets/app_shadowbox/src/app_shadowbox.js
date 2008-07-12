/*
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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
