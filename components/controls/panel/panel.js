Appcelerator.UI.registerUIComponent('control','panel',
{
	create: function()
	{
		this.options = null;
		this.id = null;
		this.getAttributes = function()
		{
			var T = Appcelerator.Types;

			return [{name: 'theme', optional: true, description: "theme for the panel",defaultValue: Appcelerator.UI.getDefaultTheme('panel')},
					{name: 'height', optional: true, description: " height for panel" ,defaultValue: 'auto', type: T.cssDimension},		 
					{name: 'width', optional: true, description: " width for panel" ,defaultValue: 'auto', type: T.cssDimension},		 
					{name: 'footer', optional: true, description: " footer for panel" , defaultValue: ''},
					{name: 'title', optional: true, description: " title for panel" , defaultValue: ''},
					{name: 'closeable', optional: true, description: " is panel closeable" , defaultValue: true}
					];
		}

		/**
		 * The version of the control. This will automatically be corrected when you
		 * publish the component.
		 */
		this.getVersion = function()
		{
			// leave this as-is and only configure from the build.yml file 
			// and this will automatically get replaced on build of your distro
			return '1.0';
		}
		/**
		 * The control spec version.  This is used to maintain backwards compatability as the
		 * Widget API needs to change.
		 */
		this.getSpecVersion = function()
		{
			return 1.0;
		}
		this.title =  function(value)
		{
			var title = value
			if (typeof(value) == "object")
			{
				if (value)
				{
					title = value.args[0].value
				}
			}
			$(this.id+'_title').innerHTML = title;
		}
		this.footer = function(value)
		{
			var value = value
			if (typeof(value) == "object")
			{
				if (value)
				{
					value = value.args[0].value
				}
			}
			$(this.id+'_footer').innerHTML = value;
		}
		this.content = function(value)
		{
			var value = value
			if (typeof(value) == "object")
			{
				if (value)
				{
					value = value.args[0].value
				}
			}
			$(this.id+'_content').innerHTML = value;
		}
		this.theme = function(value)
		{
			var theme = value
			if (typeof(value) == "object")
			{
				if (value)
				{
					theme = value.args[0].value
				}
			}
			Appcelerator.UI.loadTheme('control','panel',theme,$(this.id),this.options);
			var oldTheme = this.options.theme;
			$$('.' + oldTheme).each(function(el)
			{
				Element.removeClassName(el,oldTheme);
				Element.addClassName(el,theme)					
			});
			this.options['theme'] = theme;

		}
		this.getActions = function()
		{
			return ['title','footer','theme','content'];
		}

		this.build = function(element,options)
		{
			this.options = options;
			this.id = element.id
			var theme =  options['theme'];

			var html = '<div id="'+element.id+'_hdr" class="panel ' + theme + ' header">';				
			html += '<div  id="'+element.id+'_tl" class="panel '+theme+' top_left"></div>';
			html += '<div id="' + element.id + '_title" class="panel '+theme+' title">'+options['title']+'</div>';			

			if (options['closeable'] == true)
			{
				html += '<div id="' + element.id + '_close" class="panel '+theme+' close"></div>';			
			}
			html += '<div  id="'+element.id+'_tr" class="panel '+theme+' top_right"></div>';
			html += '</div>';

			if (Appcelerator.Browser.isIE6)
			{
				options['height'] = (options['height']=='auto')?'30px':options['height'];
			}
			html += '<div id="'+element.id+'_content" class="panel '+theme+ ' body" style="height:'+options['height']+'">';
			html += element.innerHTML;
			html += '</div>';
			html += '<div  id="'+element.id+'_btm" class="panel '+theme+' bottom">';
			html += '<div  id="'+element.id+'_bl" class="panel '+theme+' bottom_left"></div>';
			html += '<div id="' + element.id + '_footer" class="panel '+theme+' bottom_text ">'+options['footer']+'</div>';			
			html += '<div  id="'+element.id+'_br" class="'+theme+' bottom_right"></div>';
			html += '</div>';			
			html += '</div>';			
			element.innerHTML = html;
			element.style.width = options['width'];
			element.style.height = "auto";
			element.className = "panel container "+theme;

			// wire close	
			if (options['closeable'] == true)
			{
				var mainHandler = Element.observe(element.id+'_close','click',function(e)
				{
					Element.hide(element.id);
					Appcelerator.Compiler.fireCustomCondition(element.id, 'hide', {'id': element.id});

				});			

			}

			// if tooltip and IE need width
			if (Appcelerator.Browser.isIE)
			{
				Appcelerator.UI.addElementUIDependency(element,'control','panel','behavior', 'tooltip', function(element)
				{
					if (options['width']=='auto')
					{
						$(element.id + "_panel").style.width = "300px";
						element.style.width = "300px";			
					}
				});
			}
			// IE and FF shadow + panel needs width
			if (Appcelerator.Browser.isIE6 || Appcelerator.Browser.isGecko)
			{
				var parentWidth = Element.getStyle(element.parentNode,'width');
				var width = "220px"

				// use parent if we are in a grid layout
				if (parentWidth && parentWidth.endsWith('px') && element.parentNode.getAttribute('cols'))
				{
					width = parentWidth;
				}

				// always set if IE6
				if (Appcelerator.Browser.isIE6 && options['width']=='auto')
				{
					$(element.id + "_panel").style.width =width;	
					element.style.width = width;
				}

				// set for shadow for all IEs
				Appcelerator.UI.addElementUIDependency(element,'control','panel','behavior', 'shadow', function(element)
				{
					// must set width on IE with shadow
					if (options['width']=='auto')
					{
						$(element.id + "_panel").style.width = width;
						element.style.width = width;

					}
				});
			}

			// fix PNGs
			if (Appcelerator.Browser.isIE6)
			{
				$(element.id + "_tl").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
				$(element.id + "_hdr").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
				$(element.id + "_tr").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
				$(element.id + "_bl").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
				$(element.id + "_btm").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
				$(element.id + "_br").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
				if (options['closeable'] == true)
				{
					$(element.id + "_close").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/images/appcelerator/iepngfix.htc');
				}
			}

			Appcelerator.UI.loadTheme('control','panel',options['theme'],element,options);
		}
	}
});
