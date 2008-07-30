Appcelerator.UI.registerUIComponent('layout','border',
{
	/**
	 * The attributes supported by the layouts. This metadata is 
	 * important so that your layout can automatically be type checked, documented, 
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
		
		//TODO
		return [];
	},
	/**
	 * The version of the layout. This will automatically be corrected when you
	 * publish the component.
	 */
	getVersion: function()
	{
		// leave this as-is and only configure from the build.yml file 
		// and this will automatically get replaced on build of your distro
		return '__VERSION__';
	},
	/**
	 * The layout spec version.  This is used to maintain backwards compatability as the
	 * Widget API needs to change.
	 */
	getSpecVersion: function()
	{
		return 1.0;
	},
	/**
	 * This is called when the layout is loaded and applied for a specific element that 
	 * references (or uses implicitly) the layout.
	 */
	build:  function(element,options)
	{
		var e = element.down('*[pos=east]');
		var w = element.down('*[pos=west]');
		var n = element.down('*[pos=north]');
		var s = element.down('*[pos=south]');
		var c = element.down('*[pos=center]');
		
		var html = "<table width='100%' class='borderlayout' border='0' cellpadding='0' cellspacing='0'>";
		
		html+='<tr>';
		html+='<td colspan="3" align="center">';
		html+='<div id="' + element.id + '_north" class="borderlayout_north"></div>'
		html+='</td>';
		html+='</tr>';
		html+='<tr>';
		html+='<td colspan="1" align="left">';
		html+='<div id="' + element.id + '_west" class="borderlayout_left"></div>'
		html+='</td>';
		html+='<td colspan="1" align="center">';
		html+='<div id="' + element.id + '_center" class="borderlayout_center"></div>'
		html+='</td>';
		html+='<td colspan="1" align="right">';
		html+='<div id="' + element.id + '_east" class="borderlayout_east"></div>'
		html+='</td>';
		html+='</tr>';
		html+='<tr>';
		html+='<td colspan="3" align="center">';
		html+='<div id="' + element.id + '_south" class="borderlayout_south"></div>'
		html+='</td>';
		html+='</tr>';
		html+='</table>';
		element.innerHTML = html;
		
		if (n)
		{
			var ne = $(element.id+'_north');
			ne.appendChild(n);
			ne.parentNode.setAttribute('align',n.getAttribute('align')||'center');
		}
		if (s)
		{
			var ne = $(element.id+'_south');
			ne.appendChild(s);
			ne.parentNode.setAttribute('align',s.getAttribute('align')||'center');
		}
		if (e)
		{
			var ne = $(element.id+'_east');
			ne.appendChild(e);
			ne.parentNode.setAttribute('align',e.getAttribute('align')||'right');
		}
		if (w)
		{
			var ne = $(element.id+'_west');
			ne.appendChild(w);
			ne.parentNode.setAttribute('align',w.getAttribute('align')||'left');
		}
		if (c)
		{
			var ne = $(element.id+'_center');
			ne.appendChild(c);
			ne.parentNode.setAttribute('align',c.getAttribute('align')||'center');
		}
	}
});
