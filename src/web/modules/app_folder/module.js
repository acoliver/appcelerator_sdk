
Appcelerator.Module.Folder =
{
	modulePath:null,
	
	setPath: function(path)
	{
		this.modulePath = path;
	},
	getName: function()
	{
		return 'appcelerator folder';
	},
	getDescription: function()
	{
		return 'folder widget';
	},
	getVersion: function()
	{
		return 1.0;
	},
	getAuthor: function()
	{
		return 'Jeff Haynie';
	},
	getModuleURL: function ()
	{
		return 'http://www.appcelerator.org';
	},
	isWidget: function ()
	{
		return true;
	},
	getWidgetName: function()
	{
		return 'app:folder';
	},
	buildWidget: function(element)
	{
		var html = '', code = '', oncode = Appcelerator.Compiler.parseOnAttribute(element);
		var x = 0;
		var id = element.id;
		var itemnodes = [];
		
		if (Appcelerator.Browser.isIE)
		{
			// NOTE: in IE, you have to append with namespace
			var newhtml = element.innerHTML;
			newhtml = newhtml.replace(/<FOLDER/g,'<APP:FOLDER').replace(/\/FOLDER>/g,'/APP:FOLDER>');
			newhtml = newhtml.replace(/<ITEM/g,'<APP:ITEM').replace(/\/ITEM>/g,'/APP:ITEM>');
			element.innerHTML = newhtml;
		}
		
		for (var c=0;c<element.childNodes.length;c++)
		{
			var node = element.childNodes[c];
			if (node.nodeType == 1 && node.nodeName.toLowerCase() == 'folder')
			{
				var folder_opened_icon = node.getAttribute('opened_icon') || Appcelerator.Module.Folder.modulePath + 'images/folder_opened.png';
				var folder_closed_icon = node.getAttribute('closed_icon') || Appcelerator.Module.Folder.modulePath + 'images/folder_closed.png';
				var parentid = id+"_folder_"+ (x++);
				html+='<div id="'+parentid+'">';
				html+='<div class="folder"><img class="folder_image" src="'+folder_closed_icon+'" id="'+parentid+'_closed"/>';
				html+='<img class="folder_image" src="'+folder_opened_icon+'" id="'+parentid+'_opened" style="display:none"/>';
				html+='<span class="folder_name" id="'+parentid+'_name">'+node.getAttribute('name')+'</span></div>';
				html+='<div class="folder_children" id="'+parentid+'_children" style="display:none">';
				var children = $A(node.childNodes).findAll(function(n){ return n.nodeType == 1 && n.nodeName.toLowerCase()=='item'; });
				var childcloser='';
				children.each(function(child,b)
				{
					var item_open_icon = child.getAttribute('opened_icon') || Appcelerator.Module.Folder.modulePath + 'images/item_opened.png';
					var item_closed_icon = child.getAttribute('closed_icon') || Appcelerator.Module.Folder.modulePath + 'images/item_closed.png';
					var childid = parentid+'_child_'+b;
					html+='<div id="'+childid+'">';
					html+='<div id="'+childid+'_item" class="item"><img class="item_image" src="'+item_closed_icon+'" id="'+childid+'_closed"/>';
					html+='<img class="item_image" src="'+item_open_icon+'" id="'+childid+'_opened" style="display:none"/>';
					html+='<span class="item_name" id="'+childid+'_name">'+Appcelerator.Compiler.getHtml(child,true)+'</span>';
					html+='</div></div>';
					var openaction = child.getAttribute('onopen');
					var closeaction = child.getAttribute('onclose');
					if (openaction)
					{
						openaction = Appcelerator.Compiler.makeAction(childid,openaction) +";";
					}
					if (closeaction)
					{
						closeaction = Appcelerator.Compiler.makeAction(childid,closeaction) + ";";
					}
					itemnodes.push(childid);
					var closercode ="$A($('"+parentid+"_children').childNodes).findAll(function(n){return n.nodeType==1;}).each(function(n){if (n.id!='"+childid+"') $(n.id)._onclosed();});";
					code+="$('"+childid+"')._onopened = function(){ if (!$('"+childid+"').opened){ itemCloser('"+childid+"'); Element.removeClassName('"+childid+"_item','closed'); Element.addClassName('"+childid+"_item','open'); $('"+childid+"').opened=true; "+(openaction||'')+" Element.hide('"+childid+"_closed'); Element.show('"+childid+"_opened'); "+closercode+"}};";
					code+="$('"+childid+"')._onclosed = function(){ if ($('"+childid+"').opened){ $('"+childid+"').opened=false; Element.removeClassName('"+childid+"_item','open'); Element.addClassName('"+childid+"_item','closed'); "+(closeaction||'')+" Element.hide('"+childid+"_opened'); Element.show('"+childid+"_closed');}};";
					code+="$('"+childid+"_closed').onclick=function(){$('"+childid+"')._onopened();};";
					code+="$('"+childid+"_opened').onclick=function(){$('"+childid+"')._onclosed();};";
					code+="$('"+childid+"').onclick=function(e){e=Event.getEvent(e);e.stop();if ($('"+childid+"').opened) $('"+childid+"')._onclosed(); else $('"+childid+"')._onopened();};";
					childcloser+="$('"+childid+"')._onclosed();";
				});
				code+"$('"+parentid+"_closed').onclick=function(){$('"+parentid+"').opened=true; Element.removeClassName('"+parentid+"','closed'); Element.addClassName('"+parentid+"','open'); Element.hide('"+parentid+"_closed'); Element.show('"+parentid+"_opened');Element.toggle('"+parentid+"_children');};";
				code+="$('"+parentid+"_opened').onclick=function(){$('"+parentid+"').opened=false; Element.removeClassName('"+parentid+"','open'); Element.addClassName('"+parentid+"','closed'); Element.hide('"+parentid+"_opened'); Element.show('"+parentid+"_closed');Element.toggle('"+parentid+"_children'); "+childcloser+"};";
				code+="$('"+parentid+"').onclick=function(e){e=Event.getEvent(e);e.stop();$('"+parentid+"').opened=!$('"+parentid+"').opened; Element.toggle('"+parentid+"_closed'); Element.toggle('"+parentid+"_opened');Element.toggle('"+parentid+"_children'); if (!$('"+parentid+"').opened){"+childcloser+"} };";
				html+='</div></div>';
				x++;
			}
		}

		code+="var childnodes = [" + itemnodes.collect(function(n){return "'"+n+"'"}).join(",") + "];";
		code+="function itemCloser(exclude){ childnodes.each(function(child){if (exclude!=child && $(child).opened) $(child)._onclosed();}); };";
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : html,
			'initialization' : code + ';' + oncode
		};		
	}
};


Appcelerator.Core.registerModule('app:folder',Appcelerator.Module.Folder);
Appcelerator.Core.loadModuleCSS('app:folder','folder.css');