
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
	getSpecVersion: function()
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
	getAttributes: function()
    {
        return [];
    },
	compileWidget: function (params)
	{
		var itemCloser = function(exclude)
		{
			params['itemnodes'].each(function(child){if (exclude!=child && $(child).opened) $(child)._onclosed();});
		}

		var closeChildren = function(parentid, childid)
		{
			$A($(parentid+'_children').childNodes).findAll(function(n){return n.nodeType==1;}).each(function(n){if (n.id!=childid) $(n.id)._onclosed();});
		}
		
		var nodes = params['nodes'];
		
		for (var c=0;c<nodes.length;c++)
		{
			(function(){
			var node = nodes[c];
			if (node.nodeType == 1 && node.nodeName.toLowerCase() == 'folder')
			{
				var parentid = node._parentid;
				var parentnode = $(parentid);
				
				node._children.each(function(child,b)
				{
					var childid = child._childid;
					var open = child.getAttribute('open');
					var openaction = child.getAttribute('onopen');
					var closeaction = child.getAttribute('onclose');					
					
					if (openaction)
					{
						openaction = Appcelerator.Compiler.makeAction(childid,openaction);
					}

					if (closeaction)
					{
						closeaction = Appcelerator.Compiler.makeAction(childid,closeaction);
					}
					
					if (open)
					{
						var scriptcode = "$('"+parentid+"')._onopened(); $('"+childid+"')._onopened();";
						Appcelerator.Compiler.handleCondition(child, open, 'function['+scriptcode+']', null, 0, null);
					}
					$(childid)._onopened = function() 
					{ 
						if (!$(childid).opened) 
						{ 
							itemCloser(childid); 
							Element.removeClassName(childid+'_item','closed');
							Element.addClassName(childid+'_item','opened');
							$(childid).opened=true;
							Element.hide(childid+'_closed');
							Element.show(childid+'_opened');
							closeChildren(parentid, childid);
							if (openaction)
							{
								eval(openaction);
							}
						}
					};
					
					$(childid)._onclosed = function()
					{
						if ($(childid).opened)
						{
							$(childid).opened=false; 
							Element.removeClassName(childid+'_item','open');
							Element.addClassName(childid+'_item','closed');
							Element.hide(childid+'_opened'); 
							Element.show(childid+'_closed');
							if (closeaction)
							{
								eval(closeaction);
							}
						}
					};
					
					$(childid+'_closed').onclick = function()
					{
						$(childid)._onopened();
					};
					
					$(childid+'_opened').onclick = function()
					{
						$(childid)._onclosed();
					};
					
					$(childid).onclick = function(e)
					{
						e = Event.getEvent(e);
						e.stop();
						
						if ($(childid).opened)
						{
							$(childid)._onclosed(); 
						}
						else
						{
							$(childid)._onopened();
						}
					};
					
					$(childid)._onclosed();
				});
				
				$(parentid+'_closed').onclick = function()
				{
					parentnode.opened=true;
					Element.hide(parentid+'_closed');
					Element.show(parentid+'_opened');
					Element.toggle(parentid+'_children');
				};
				
				$(parentid+'_opened').onclick = function()
				{
					parentnode.opened=false;
					Element.hide(parentid+'_opened');
					Element.show(parentid+'_closed');
					Element.toggle(parentid+'_children');
				}
				
				parentnode._onopened = function()
				{
					parentnode.opened=true;
					Element.hide(parentid+'_closed');
					Element.show(parentid+'_opened');
					Element.show(parentid+'_children');	
					closeChildren(parentid, null);
				};
				
				parentnode._onclosed = function()
				{
					parentnode.opened=false;
					Element.show(parentid+'_closed');
					Element.hide(parentid+'_opened');
					Element.hide(parentid+'_children');					
					closeChildren(parentid, null);					
				}
				
				parentnode.onclick = function(e)
				{
					e=Event.getEvent(e);
					e.stop();
					if (!parentnode.opened)
					{ 
						parentnode._onopened();
					} 
					else
					{ 
						parentnode._onclosed();
					}
				};
			}
			})();
		}
	},
	buildWidget: function(element, parameters)
	{
		var html = '';
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
				node._parentid = parentid;
				html+='<div id="'+parentid+'">';
				html+='<div class="folder" id="'+parentid+'_folder"><img class="folder_image" src="'+folder_closed_icon+'" id="'+parentid+'_closed"/>';
				html+='<img class="folder_image" src="'+folder_opened_icon+'" id="'+parentid+'_opened" style="display:none"/>';
				html+='<span class="folder_name" id="'+parentid+'_name">'+node.getAttribute('name')+'</span></div>';
				html+='<div class="folder_children" id="'+parentid+'_children" style="display:none">';
				var children = $A(node.childNodes).findAll(function(n){ return n.nodeType == 1 && n.nodeName.toLowerCase()=='item'; });
				node._children = children;
				var childcloser='';
				children.each(function(child,b)
				{
					var item_open_icon = child.getAttribute('opened_icon') || Appcelerator.Module.Folder.modulePath + 'images/item_opened.png';
					var item_closed_icon = child.getAttribute('closed_icon') || Appcelerator.Module.Folder.modulePath + 'images/item_closed.png';
					var childid = parentid+'_child_'+b;
					child._childid = childid;
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
				});
				html+='</div></div>';
				x++;
			}
		}
		
		parameters['nodes'] = element.childNodes;
		parameters['itemnodes'] = itemnodes;
		
		return {
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'presentation' : html,
			'compile' : true
		};
	}
};


Appcelerator.Core.registerModule('app:folder',Appcelerator.Module.Folder);
Appcelerator.Core.loadModuleCSS('app:folder','folder.css');

