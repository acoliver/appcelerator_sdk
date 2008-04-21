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
