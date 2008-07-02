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
		html += '<div class="' + classPrefix + '_hdr">';
				
		html += '<div class="'+classPrefix+'_tl"></div>';
		
		html += '<div id="' + element.id + '_title" class="'+classPrefix+'_title">'+options['title']+'</div>';			

		if (options['closeable'] == true)
		{
			html += '<div id="' + element.id + '_close" class="'+classPrefix+'_close" on="click then l:app.close.panel[id='+element.id+']"></div>';			
		}
		
		html += '<div class="'+classPrefix+'_tr"></div>';
		html += '</div>';
		
		// shadow
		html += '<div class="'+classPrefix+'_shadow_top"></div>';
		html += '<div class="'+classPrefix+'_shadow_left"></div>';
		html += '<div class="'+classPrefix+'_shadow_right"></div>';
		html += '<div class="'+classPrefix+'_shadow_bottom"></div>';
		
		html += '<div class="'+classPrefix+'_body">';
		html += element.innerHTML;
		
		html += '</div>';

		html += '<div class="'+classPrefix+'_btm">';
		html += '<div class="'+classPrefix+'_bl"></div>';
		
		if (options['footer'] != "")
		{
			html += '<div id="' + element.id + '_footer" class="'+classPrefix+'_btm_text ">'+options['footer']+'</div>';			
		}
		html += '<div class="'+classPrefix+'_br"></div>';

		html += '</div>';			
		html += '</div>';			
		element.innerHTML = html;
		Appcelerator.Core.loadTheme('type','panel',options['theme']);	
	}
});
