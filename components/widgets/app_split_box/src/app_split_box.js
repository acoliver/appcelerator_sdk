/**
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

Appcelerator.Widget.AppSplitBox =
{
    path:null,
    
    setPath:function(path)
    {
        this.path = path;
    },
	/**
	 * The name of the widget
	 */
	getName: function()
	{
		return 'app:split_box';
	},
	/**
	 * A description of what the widget does
	 */
	getDescription: function()
	{
		return 'app:split_box is box widget which uses a splitter for resizing the contents';
	},
	/**
	 * The version of the widget. This will automatically be corrected when you
	 * publish the widget.
	 */
	getVersion: function()
	{
		return '__VERSION__';
	},
	/**
	 * The widget spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * The widget author's full name (that's you)
	 */
	getAuthor: function()
	{
		return 'Jeff Haynie';
	},
	/**
	 * The URL for more information about the widget or the author.
	 */
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	/**
	 * This should always return true for widgets.
	 */
	isWidget: function ()
	{
		return true;
	},
	/**
	 * The widget's tag name
	 */
	getWidgetName: function()
	{
		return 'app:split_box';
	},
	/**
	 * The attributes supported by the widget as attributes of the tag.  This metadata is 
	 * important so that your widget can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [
			{name: 'mode', optional: false, description: "Vertical or horizontal alignment",type: T.enumeration('vertical', 'horizontal')},
			{name: 'size', optional: true, description: "Splitter size in pixels", type: T.number, defaultValue: 8},
			{name: 'background', optional: true, description: "Splitter background color", type: T.color, defaultValue: '#ccc' },
			{name: 'backgroundHover', optional: true, description: "Splitter background hover color", type: T.color, defaultValue: '#aaa' },
			{name: 'handleOnHover', optional: true, description: "Show splitter handle only on hover", type: T.bool, defaultValue: false },
			{name: 'livedragging', optional: true, description: "Update resized contents as splitter is dragged", type: T.bool, defaultValue: true }
		];
	},
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		return [];
	},	
	/**
	 * this method will be called after the widget has been built, the content replaced and available
	 * in the DOM and when it is ready to be compiled.
	 *
	 * @param {object} parameters
	 */
	compileWidget: function(parameters)
	{
		var id = parameters['id'];
		
		if (parameters['panelA']) $('splitter1_'+id).appendChild(parameters['panelA']);
		if (parameters['panelB']) $('splitter2_'+id).appendChild(parameters['panelB']);
		
		var imagePath = this.path + 'images/';
		var mode = parameters['mode'];
		var options = {
			imageDir:imagePath,
			withImage:true,
			closeOnLeftUp:true,
			left:0,
			top:0,
			width:'100%', 
			height:'100%', 
			panel1Prop: parameters['panel1Prop'] || 0.5, 
			panel2Prop: parameters['panel2Prop'] || 0.5,
			splitterWidth: parameters['size'],
			splitterBg: parameters['background'],
			splitterBgHover: parameters['backgroundHover'],
			handleOnHover: parameters['handleOnHover']=='true',
			livedragging: parameters['livedragging']=='true'
		};
		switch (mode)
		{
			case 'horizontal':
			{
				new UI.HorizontalSplitter(parameters['id'],options);
				break;
			}
			case 'vertical':
			{
				new UI.VerticalSplitter(parameters['id'],options);
				break;
			}
		}
	},
	/**
	 * this method will be called each time a <app:split_box> is encountered in a page. the return object gives
	 * instructions to the compiler about how to process the widget.
	 *
	 * @param {element} dom element for the <app:split_box> encountered in the page
	 * @param {object} parameters object for the attributes that <app:split_box> supports
	 */
	buildWidget: function(element,parameters)
	{
		var el = document.createElement('div');
		el.innerHTML = Appcelerator.Compiler.specialMagicParseHtml(element.innerHTML);
		
		var a = null, b = null;
		
		var vertical = parameters['mode']=='vertical';
		
		var getPercent = function(el,def)
		{
			var name = vertical ? 'height' : 'width';
			var amt = el.getAttribute(name);
			if (amt)
			{
				amt = parseInt(amt);
				return amt / 100;
			}
			return def;
		};
		
		for (var c=0;c<el.childNodes.length;c++)
		{
			var node = el.childNodes[c];
			if (node.nodeType == 1)
			{
				if (a==null)
				{
					a = node;
					parameters['panel1Prop'] = getPercent(node,0.5);
				}
				else
				{
					b = node;
					parameters['panel2Prop'] = getPercent(node,0.5);
				}
			}
		}

		var html = '<div id="splitter1_'+element['id']+'"></div><div id="splitter2_'+element['id']+'"></div>';

		parameters['panelA']=a;
		parameters['panelB']=b;

		return {
			'presentation' : html,   // this is the HTML to replace for the contents <app:split_box>
			'position' : Appcelerator.Compiler.POSITION_REPLACE,  // usually the default, could be POSITION_REMOVE to remove <app:split_box> entirely
			'wire' : true,  // true to compile the contents of the presentation contents replaced above
			'compile' : true,  // true to call compileWidget once the HTML has been replaced and available in the DOM
			'parameters': parameters  // parameters object to pass to compileWidget
		};		
	}
};

Appcelerator.Widget.requireCommonJS('scriptaculous/builder.js',function()
{
	Appcelerator.Widget.registerWidgetWithJS('app:split_box',Appcelerator.Widget.AppSplitBox,['splitter.js']);
});


