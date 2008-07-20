Appcelerator.UI.registerUIComponent('control','accordion',
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
			},
			{
				'name': 'height',
				'optional': true,
				'description': 'height of content data',
				'defaultValue': '100px'
			},
			{
				'name': 'width',
				'optional': true,
				'description': 'width of accordion',
				'defaultValue': '300px'
			},
			{
				'name': 'speed',
				'optional': true,
				'description': 'speed of the accordion',
				'defaultValue': 0.5,
				'type':T.number
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
	
	open: function(id,parameters,data,scope,version,attrs,direction,action)
	{
		if (attrs[0] && attrs[0].key == 'row')
			$MQ('l:accordion.click',{'val':id + '_' + attrs[0].value});
	},
	getActions: function()
	{
		return ['open'];
	},
	
	/**
	 * This is called when the control is loaded and applied for a specific element that 
	 * references (or uses implicitly) the control.
	 */
	build:  function(element,options)
	{
		var classPrefix = "accordion_" + options['theme'];
		var container = document.createElement('div');
		container.className = classPrefix + "_container";
		container.style.width = options['width'];
		if (element.getAttribute("on"))
		{
			container.setAttribute("on",element.getAttribute("on"));
		}
		var html = '';
		var count = 0;
		for (var c=0,len=element.childNodes.length;c<len;c++)
		{
			var node = element.childNodes[c];
			if (node.nodeType == 1)
			{				
				// row container
				html +='<div class="'+classPrefix + '_row" on="click then l:accordion.click[val='+element.id+'_'+count+']">';
				html +=' <div id="'+element.id + '_accordion_left_'+count+'" class="'+classPrefix+'_row_left" on="l:accordion.click[val='+element.id+'_'+count+'] then add[class='+classPrefix+'_row_left_active] else remove[class='+classPrefix+'_row_left_active]"></div>';
				html +=' <div id="'+element.id + '_accordion_middle_'+count+'" class="'+classPrefix+'_row_middle" style="width:'+options['width']+'"  on="l:accordion.click[val='+element.id+'_'+count+'] then add[class='+classPrefix+'_row_middle_active] else remove[class='+classPrefix+'_row_middle_active]">';
				
				if (node.getAttribute("title"))
				{
					html += node.getAttribute("title");
				}
				html +='</div><div id="'+element.id + '_accordion_right_'+count+'" class="'+classPrefix+'_row_right"  on="l:accordion.click[val='+element.id+'_'+count+'] then add[class='+classPrefix+'_row_right_active] else remove[class='+classPrefix+'_row_right_active]"></div></div>';

				// row data
				html += '<div class="'+classPrefix+'_row_data" on="l:accordion.click[val='+element.id+'_'+count+'] then effect[Morph,style=height:'+options['height']+',duration:'+options['speed']+']';
				html += ' else effect[Morph,style=height:0px,duration:'+options['speed']+']" style="width:'+options['width']+'">';
				if (Appcelerator.Browser.isIE)
				{
					html += '<div on="l:accordion.click[val='+element.id+'_'+count+'] then show else hide" style="display:none">'+node.outerHTML+'</div>';	
				}
				else
				{
					html += '<div on="l:accordion.click[val='+element.id+'_'+count+'] then show else hide" style="display:none">'+Appcelerator.Util.Dom.toXML(node,true,Appcelerator.Compiler.getTagname(node)) + '</div>';	
				}
				html += '</div>';
				count++;
			
			}
		}	
		container.innerHTML = html;
		Appcelerator.Compiler.dynamicCompile(container);
		new Insertion.Before(element,container);
		element.innerHTML = '';

		// deal with IE PNG issue
		if (Appcelerator.Browser.isIE6)
		{
			for (var i=0;i<count;i++)
			{
				$(element.id +"_accordion_left_"+i).addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');	
				$(element.id +"_accordion_middle_"+i).addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');	
				$(element.id +"_accordion_right_"+i).addBehavior(Appcelerator.Core.getModuleCommonDirectory() + '/js/appcelerator/common/images/iepngfix.htc');	
			}
		}
		
		Appcelerator.Core.loadTheme('control','accordion',options['theme'],element,options);	
	}
});
