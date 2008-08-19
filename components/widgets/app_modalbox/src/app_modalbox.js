/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/


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
