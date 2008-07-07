Appcelerator.UI.registerUIComponent('type','panel',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'theme', optional: true, description: "theme for the panel",defaultValue: 'basic'},
				{name: 'width', optional: true, description: " width for panel" ,defaultValue: '300px', type: T.cssDimension},		 
				{name: 'footer', optional: true, description: " footer for panel" , defaultValue: ''},
				{name: 'title', optional: true, description: " title for panel" , defaultValue: ''},
				{name: 'closeable', optional: true, description: " is panel closeable" , defaultValue: true}
				];
	},
	
	title:function(id,parameters,data,scope,version,attrs,direction,action)
	{
		var key = 'value';
		if (attrs && typeof(v) == 'string')
		{
			attrs = attrs.evalJSON();
		}
		if (attrs && attrs.length > 0)
		{
			key = attrs[0].key;
		}
		$(id + '_title').innerHTML = Object.getNestedProperty(data,key) || '';
	},
	
	footer:function(id,parameters,data,scope,version,attrs,direction,action)
	{
		var key = 'value';
		if (attrs && typeof(v) == 'string')
		{
			attrs = attrs.evalJSON();
		}
		if (attrs && attrs.length > 0)
		{
			key = attrs[0].key;
		}
		$(id + '_footer').innerHTML = Object.getNestedProperty(data,key) || '';
	},
	
	show:function(id,parameters,data,scope,version,attrs,direction,action)
	{
		Element.show(id);
	},

	hide:function(id,parameters,data,scope,version,attrs,direction,action)
	{
		Element.hide(id);
	},
	getActions: function()
	{
		return ['title','footer','show','hide'];
	},
	
	build: function(element,options)
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
				$(element.id + "_close").addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');

		}
		
		Appcelerator.Core.loadTheme('type','panel',options['theme']);	
	}
});
