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
 * ==========================================================================
 *
 * This code uses the super-awesome image cropper code developed by David Spurr.  See the file cropper.js for the source file.
 * 
 * Copyright (c) 2006, David Spurr (http://www.defusion.org.uk/)
 * All rights reserved.
 * 
 * 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the 
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the David Spurr nor the names of its contributors may be used to endorse or promote products derived from this software 
 *       without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, 
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS 
 * BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE 
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, 
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * http://www.opensource.org/licenses/bsd-license.php
 */

Appcelerator.Widget.AppImageCropper =
{
	listeners: {},
	
	registerCropHandler:function(id,actionFunc,ifCond,delay)
	{
		this.listeners[id] = {'action':actionFunc,'ifcond':ifCond,'delay':delay};
	},
	
	/**
	 * The name of the widget
	 */
	getName: function()
	{
		return 'app:image_cropper';
	},
	/**
	 * A description of what the widget does
	 */
	getDescription: function()
	{
		return 'app:image_cropper is a UI control for cropping and resizing images';
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
		return 'app:image_cropper';
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
			{
				name: 'src', 
				optional: true, 
				description: "image source href",
		        type: T.pathOrUrl
			},
			{
				name: 'on',
				optional: true,
				description: 'on expression',
				type: T.onExpr
			},
			{
				name: 'minWidth',
				optional: true,
				defaultValue: 0,
				description: "The minimum width for the select area in pixels",
				type: T.number
			},
			{
				name: 'maxWidth',
				optional: true,
				defaultValue: 0,
				description: "The maximum width for the select areas in pixels (if both minWidth & maxWidth set to same the width of the cropper will be fixed)",
				type: T.number
			},
			{
				name: 'minHeight',
				optional: true,
				defaultValue: 0,
				description: "The mimimum height for the select area in pixels",
				type: T.number
			},
			{
				name: 'maxHeight',
				optional: true,
				defaultValue: 0,
				description: "The maximum height for the select areas in pixels (if both minHeight & maxHeight set to same the height of the cropper will be fixed)",
				type: T.number
			},
			{
				name: 'displayOnInit',
				optional: true,
				defaultValue: true,
				description: "Whether to display the select area on initialization, only used when providing minimum width & height or ratio",
				type: T.bool
			},
			{
				name: 'ratio',
				optional: true,
				defaultValue: null,
				description: "The pixel dimensions to apply as a restrictive ratio with properties x and y",
				type: T.json
			},
			{
				name: 'coordinates',
				optional: true,
				defaultValue: null,
				description: "A coordinates object with properties x1, y1, x2 & y2; for the coordinates of the select area to display onload",
				type: T.json
			},
			{
				name: 'preview',
				optional: true,
				defaultValue: null,
				description: "allow for presentation of a preview image of the resulting crop by specifying the ID of an element to show preview",
				type: T.identifier
			}
		];
	},
	
	/**
	 * return an array of function names for the actions the widget supports in the widget's 
	 * on expression.
	 */
	getActions: function()
	{
		return ['update'];
	},	
	
	update: function(id,params,data,scope,version,payload)
	{
		var src = null;
		var parameters = params;
		
		for (var c=0;c<payload.length;c++)
		{
			if (payload[c].key == 'src')
			{
				src = Object.getNestedProperty(data,payload[c].value);
			}
		}
		if (src)
		{
			parameters['src'] = src;
			Appcelerator.Widget.AppImageCropper.buildCropper(parameters);
		}
	},
	 
	/**
	 * this method will be called after the widget has been built, the content replaced and available
	 * in the DOM and when it is ready to be compiled.
	 *
	 * @param {object} parameters
	 */
	compileWidget: function(parameters)
	{
		Appcelerator.Widget.AppImageCropper.buildCropper(parameters);
	},
	
	buildCropper:function(parameters)
	{
		var id = parameters['id'];
		var src = 'imagecropper_' + id;
		var image = $(src);
		
		if (!image)
		{
			Logger.error('Error creating '+this.getName()+', could\'t find image with ID: '+src);
			return;
		}
				
		if (image._cropper)
		{
			image._cropper.remove(); 
		}
		
		var href = parameters['src'];

		if (href)
		{
			if (image.getAttribute('init')=='true')
			{
				image.setAttribute('init','');
			} 
			else
			{
				image.src = href;
			}
			var options = Object.extend(parameters,{
				onEndCrop: function(coords, dimensions) 
				{
					var entry = Appcelerator.Widget.AppImageCropper.listeners[id];
					if (entry)
					{
						var action = entry['action'];
						var delay = entry['delay'];
						var ifcond = entry['ifcond'];
						var actionFunc = Appcelerator.Compiler.makeConditionalAction(id,action,ifcond,{id:id,dimensions:dimensions,coordinates:coords});
						Appcelerator.Compiler.executeAfter(actionFunc,delay);
					}
				}
			});
			options['onloadCoords'] = parameters['coordinates'] ? parameters['coordinates'].evalJSON() : null;
			options['ratioDim'] = parameters['ratio'] ? parameters['ratio'].evalJSON() : {x:0,y:0};
			
			
			if (parameters['preview'])
			{ 
				options['previewWrap'] = parameters['preview'];
				var exists = $(parameters['preview']);
				if (exists)
				{
					image._cropper = new Cropper.ImgWithPreview(src,options);
				}
				else
				{
					// 
					// we've specified a preview that we can't yet find in the DOM, so we
					// need to wait until after the document is completed its compile and 
					// then attempt again
					//
					Appcelerator.Compiler.afterDocumentCompile(function()
					{
						image._cropper = new Cropper.ImgWithPreview(src,options);
					});
				}
			}
			else
			{
				if (Appcelerator.Browser.isSafari)
				{
					// safari doesn't work if the image isn't loaded
					Event.observe(image,'load',function()
					{
						image._cropper = new Cropper.Img(src,options); 
					});
				}
				else
				{
					image._cropper = new Cropper.Img(src,options); 
				}
			}
		}
	},
	/**
	 * this method will be called each time a <app:image_cropper> is encountered in a page. the return object gives
	 * instructions to the compiler about how to process the widget.
	 *
	 * @param {element} dom element for the <app:image_cropper> encountered in the page
	 * @param {object} parameters object for the attributes that <app:image_cropper> supports
	 */
	buildWidget: function(element,parameters)
	{
		var src = parameters['src'];
		var id = parameters['id'];
		
		var html = '<img ' + (src!=null ? 'src="' + src + '" init="true"' : '') + ' id="imagecropper_'+id+'"/>';
		
		return {
			'presentation' : html,   // this is the HTML to replace for the contents <app:image_cropper>
			'position' : Appcelerator.Compiler.POSITION_REPLACE,  // usually the default, could be POSITION_REMOVE to remove <app:image_cropper> entirely
			'wire' : false,  // true to compile the contents of the presentation contents replaced above
			'compile' : true,  // true to call compileWidget once the HTML has been replaced and available in the DOM
			'parameters': parameters  // parameters object to pass to compileWidget
		};		
	}
};

Appcelerator.Compiler.registerCustomCondition(
{
	conditionNames: ['imagecrop'],
	description: "Respond to imagecrop events on the element"
},
function(element,condition,action,elseAction,delay,ifCond)
{
	Appcelerator.Widget.AppImageCropper.registerCropHandler(element.id,action,ifCond,delay);
	return true;
});

Appcelerator.Widget.loadWidgetCSS('app:image_cropper','cropper.css');

Appcelerator.Widget.requireCommonJS('scriptaculous/builder.js',function()
{
	Appcelerator.Widget.registerWidgetWithJS('app:image_cropper',Appcelerator.Widget.AppImageCropper,['cropper.js']);
});


