Appcelerator.UI.registerUIComponent('control','panel',
{
	/**
	 * The attributes supported by the controls. This metadata is 
	 * important so that your control can automatically be type checked, documented, 
	 * so the IDE can auto-sense the widgets metadata for autocomplete, etc.
	 */
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		
		/*
		Example: 
		return [{name: 'mode', optional: false, description: "Vertical or horizontal alignment",
		         type: T.enumeration('vertical', 'horizontal')}]
		*/
		
		return [
			{
				'name': 'theme',
				'optional': true,
				'description': 'name of theme to use for this control',
				'type': T.identifier
			}
		];
	},
	/**
	 * The version of the control. This will automatically be corrected when you
	 * publish the component.
	 */
	getVersion: function()
	{
		// leave this as-is and only configure from the build.yml file 
		// and this will automatically get replaced on build of your distro
		return '__VERSION__';
	},
	/**
	 * The control spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * This is called when the control is loaded and applied for a specific element that 
	 * references (or uses implicitly) the control.
	 */
	build:  function(element,options)
	{
		var classPrefix = "panel_" + options['theme'];
		
		var html = '<div id="'+element.id+'_panel" style="width:'+options['width']+'" class="'+classPrefix+'">';
		html += '<div id="'+element.id+'_hdr" class="' + classPrefix + '_hdr">';
				
		html += '<div  id="'+element.id+'_tl" class="'+classPrefix+'_tl"></div>';
		
		html += '<div id="' + element.id + '_title" class="'+classPrefix+'_title">'+options['title']+'</div>';			

		if (options['closeable'] == true)
		{
			html += '<div id="' + element.id + '_close" class="'+classPrefix+'_close" on="click then l:app.close.panel[id='+element.id+']"></div>';			
		}
		
		html += '<div  id="'+element.id+'_tr" class="'+classPrefix+'_tr"></div>';
		html += '</div>';
		
		
		html += '<div class="'+classPrefix+'_body">';
		html += element.innerHTML;
		
		html += '</div>';

		html += '<div  id="'+element.id+'_btm" class="'+classPrefix+'_btm">';
		html += '<div  id="'+element.id+'_bl" class="'+classPrefix+'_bl"></div>';
		
		if (options['footer'] != "")
		{
			html += '<div id="' + element.id + '_footer" class="'+classPrefix+'_btm_text ">'+options['footer']+'</div>';			
		}
		html += '<div  id="'+element.id+'_br" class="'+classPrefix+'_br"></div>';

		html += '</div>';			
		html += '</div>';			
		element.innerHTML = html;
		// fix PNGs
		if (Appcelerator.Browser.isIE6)
		{
			$(element.id + "_tl").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			$(element.id + "_hdr").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			$(element.id + "_tr").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			$(element.id + "_bl").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			$(element.id + "_btm").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			$(element.id + "_br").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			if (options['closeable'])
			{
				$(element.id + "_close").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');
			}
		}
		
		Appcelerator.Core.loadTheme('type','panel',options['theme'],element,options);	
	}
});
