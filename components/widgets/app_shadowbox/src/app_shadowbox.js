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
