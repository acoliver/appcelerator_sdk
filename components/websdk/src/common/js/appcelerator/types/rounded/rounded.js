Appcelerator.UI.registerUIComponent('type','rounded',
{
	getAttributes: function()
	{
		var T = Appcelerator.Types;
		return [{name: 'background-color', optional: true, description: "container color for rounded ",defaultValue: '#dddddd'},
		        {name: 'width', optional: true, description: "container width for rounded ",defaultValue: '300px'},
		        {name: 'height', optional: true, description: "container height for rounded ",defaultValue: '50px'},
		        {name: 'tail', optional: true, description: "tail position ",defaultValue: '',type: T.enumeration('lt','lb','rt','rb','bl','br')},
		        {name: 'corners', optional: true, description: "round top corners ",defaultValue:"top bottom"}
		];
	},
	build: function(element,options)
	{
		var html = element.innerHTML;
		element.innerHTML = '';
		
		// determining rounding options
		var roundTL =false; var roundTR =false; var roundBR = false; var roundBL = false;
		var rOps = options['corners'].split(' ');
		for (var i=0;i<rOps.length;i++)
		{
			if (rOps[i] == "top"){roundTL = true;roundTR=true}
			if (rOps[i] == "bottom"){roundBL = true;roundBR=true}
			if (rOps[i] == "tl"){roundTL = true;}
			if (rOps[i] == "tr"){roundTR = true;}
			if (rOps[i] == "bl"){roundBL = true;}
			if (rOps[i] == "br"){roundBR = true;}
		}
		
		// build top
		for(var i=1;i<=4;i++)
		{
			this._roundContent(element,i, options['background-color'], roundTL, roundTR);
		}

		// add center content 
		element.innerHTML += '<div style="background-color:'+options['background-color']+';height:'+options['height']+'">'+html + '</div>' ;
		element.style.height=options['height'];
		element.style.width=options['width'];
		element.style.position="relative";
		element.style.marginBottom = "10px";
		
		// build bottom
		for(var i=4;i>0;i--)
		{
			this._roundContent(element,i,options['background-color'],roundBL, roundBR);
		}
		if (options['tail'] != '')
		{
			this._buildTail(element,options['background-color'],options['tail']);
		}
	},
	_buildTail: function(container, color, position)
	{
		// ARGH, IE!
		if (Appcelerator.Browser.isIE6)
		{
			var positions = {'lt':{'value':'top:20px;left:-13px;'},
							'lb':{'value':'bottom:20px;left:-13px;'},
							'rt':{'value':'top:20px;right:-13px;'},
							'rb':{'value':'bottom:20px;right:-13px;'},
							'bl':{'value':'bottom:-20px;left:20px;'},
							'br':{'value':'bottom:-20px;right:20px;'}};
			
		}
		else
		{
			var positions = {'lt':{'value':'top:20px;left:-18px;'},
							'lb':{'value':'bottom:10px;left:-18px;'},
							'rt':{'value':'top:20px;right:-18px;'},
							'rb':{'value':'bottom:10px;right:-18px;'},
							'bl':{'value':'bottom:-28px;left:20px;'},
							'br':{'value':'bottom:-29px;right:20px;'}};			
		}
						
		var html ='<div style="position:absolute;'+positions[position].value+'display:block;">';
		if (position.startsWith('r') || position == 'bl')
		{
			var total = 18;
			if (Appcelerator.Browser.isIE6) total = 13;
			for (var i=total;i>0;i--)
			{
				html += '<div style="height:1px;font-size:0pt;width:'+i+'px;background-color:'+color+';"></div>';
			}
			
		}

		else
		{
			var total = 19;
			if (Appcelerator.Browser.isIE6) total = 11;
			for (var i=0;i<19;i++)
			{
				html += '<div style="height:1px;font-size:0pt;width:'+(19-i)+'px;margin-left:'+i+'px;background-color:'+color+';"></div>';
			}
			
		}
		html+='</div>';
		container.innerHTML += html;
	},
	_roundContent: function(container, i, color, roundLeft,roundRight)
	{
	    var x=document.createElement("b");
		if (i==1)
		{
			if (roundLeft)  x.style.marginLeft = "5px";
			if (roundRight) x.style.marginRight = "5px";
			x.style.height = "1px";
		}
		if (i==2)
		{
			if (roundLeft) x.style.marginLeft = "3px";
			if (roundRight) x.style.marginRight = "3px";
			x.style.height = "1px";
		}
		if (i==3)
		{
			if (roundLeft) x.style.marginLeft = "2px";
			if (roundRight) x.style.marginRight = "2px";
			x.style.height = "1px";
		}
		if (i==4)
		{
			if (roundLeft) x.style.marginLeft = "1px";
			if (roundRight) x.style.marginRight = "1px";
			x.style.height="2px";
		}
		x.style.overflow = "hidden";			
		x.style.display = "block";			
	    x.style.backgroundColor=color;
	    container.appendChild(x);		
	}

});
