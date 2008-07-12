
Appcelerator.UI.registerUIComponent('layout','border',
{	
	getAttributes: function()
	{
		return [];
	},
	build: function(element,options)
	{
		var e = element.down('*[position=east]');
		var w = element.down('*[position=west]');
		var n = element.down('*[position=north]');
		var s = element.down('*[position=south]');
		var c = element.down('*[position=center]');
		
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
