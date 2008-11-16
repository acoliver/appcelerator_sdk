
Appcelerator.Widget.AppExtTree =
{
    getName: function()
    {
        return 'appcelerator exttree';
    },
    getDescription: function()
    {
        return 'ExtJS Tree made into an Appcelerator Widget';
    },
    getVersion: function()
    {
        return '__VERSION__';
    },
    getSpecVersion: function()
    {
        return 1.0;
    },
    getAuthor: function()
    {
        return 'Nolan Wright';
    },
    getModuleURL: function ()
    {
        return 'http://appcelerator.org';
    },
    isWidget: function ()
    {
        return true;
    },
    getWidgetName: function()
    {
        return 'app:ext_tree';
    },

	getActions: function()
	{
		return ['execute','senddata', 'select', 'select_no_fire'];
	},	

    getAttributes: function()
    {
	    var T = Appcelerator.Types;
        return [{name: 'on', optional: false, description: "on expression for tree", type: T.onExpr},
				{name: 'draggable', optional: true, defaultValue:false, description: "are tree items draggable", type: T.bool},
				{name: 'droppable', optional: true, defaultValue:false, description: "can items be dropped into tree", type: T.bool},
				{name: 'property', optional: false,  description: "array property for tree data", type: T.identifier},
				{name: 'rootText', optional: true, defaultValue:'Root', description: "name of root node"},
				{name: 'rootId', optional: true, defaultValue:'root_id', description: "id of root node"},
				{name: 'selectMessage', optional: true,  description: "message to send when node is selected", type: T.messageSend},
				{name: 'width', optional: true,  description: "width of tree panel"},
				{name: 'sendDataMessage', optional: true,  description: "Message name that contains tree data in its payload", type: T.messageSend},
				{name: 'sendDataProperty', optional: true,  description: "property name for tree array data in its payload", type: T.identifer},
				{name: 'height', optional: true,  description: "height of tree panel"},
                {name: 'lines', optional: true, description: "show tree lines", defaultValue: true, type: T.bool}

		];
    },
	treeToJSON: function(params)
	{
		var nodes = params['root'].childNodes;
		var tree = params['tree'];
		var array = [{id:params['rootId'],parent:null}];
		for(var i=0;i< nodes.length;i++)
		{
			array.push({id:nodes[i].id,parent:params['rootId'], order:i});
			Appcelerator.Module.ExtTree.processChildren(nodes[i],array);
		}
	 	return array;
	},
	processChildren: function(node,array)
	{
		var child=node.childNodes;
		for(var i=0;i<child.length;i++)
		{
			array.push({id:child[i].id,parent:node.id,order:i});
		    Appcelerator.Module.ExtTree.processChildren(child[i],array);
		}	
	},
	
	senddata: function(id,params,data,scope)
	{
		var json=Appcelerator.Module.ExtTree.treeToJSON(params);
		var property = params['sendDataProperty'];
		if (params['sendDataMessage'])
		{
			$MQ(params['sendDataMessage'], {'rows':json});
		}
	},
	select: function(id,params,data,scope) 
	{
	    var tree = params['tree'];
	    var treeNode = tree.getNodeById(data.id);
		if(treeNode) {
		    var nodePath = treeNode.getPath();
		    tree.selectPath(nodePath);
		    tree.expandPath(nodePath);
		}
	},
	select_no_fire: function(id,params,data,scope) 
	{
        var tree = params['tree'];
	    if (params['selectMessage'])
		{
			tree.getSelectionModel().purgeListeners();
		}
        Appcelerator.Widget.AppExtTree.select(id, params,data,scope);
        if (params['selectMessage'])
		{
			tree.getSelectionModel().on('selectionchange', params['select_function']);
		}
	},
	execute: function(id,params,data,scope)
	{
		// reload data only if exists
		if (params['root'])
		{
			var count = (params['root'].childNodes.length -1)
			for(var i=count;i>=0; i--) 
			{
		        params['root'].removeChild(params['root'].childNodes[i]);
		    }
			for(var i = 0; i< data[params['property']].length; i++) 
			{
		        params['root'].appendChild(params['tree'].getLoader().createNode(data[params['property']][i]));
		    }
			params['root'].expand();
			return;
		}
		// otherwise build tree
		var Tree = Ext.tree;
		// set the root node
		var root = new Tree.AsyncTreeNode({
            text: params['rootText'],
            draggable:false,
            children:data[params['property']],
            id:params['root_id']
		});

		var treeOptions = {};
		treeOptions['renderTo'] = params['id'];
		treeOptions['root'] = root;
		treeOptions['enableDD'] = (params['draggable'] == "true")?true:false;
		treeOptions['animate'] = true;
		treeOptions['lines'] = (params['lines'] == true || params['lines'] == 'true') ? true : false;
		treeOptions['selModel'] = new Ext.tree.DefaultSelectionModel();
		treeOptions['containerScroll'] = true;

		treeOptions['loader'] = new Tree.TreeLoader();

		if (params['width'])
		{
			treeOptions['width'] = params['width'];
		}
		if (params['height'])
		{
			treeOptions['height'] = params['height'];
		}

		if (params['droppable'] == "true")
		{
			 treeOptions['dropConfig'] = {allowParentInsert:true,allowContainerDrop:true};
		}
		else
		{
			 treeOptions['dropConfig'] = {allowContainerDrop:false};
		}
		var tree = new Tree.TreePanel(treeOptions);

		tree.render();
		root.expand();
		
		if (params['selectMessage'])
		{
		    params['select_function'] = function(tree,node) 
			{
				$MQ(params['selectMessage'],{'id':node.id,'text':node.text});
			};
			
			tree.getSelectionModel().on('selectionchange', params['select_function']);
			
		}
		params['tree'] = tree;
		params['root'] = root;
	},


    buildWidget: function(element,parameters)
    {
		var id = Appcelerator.Compiler.generateId();
		var html = "<div id='"+ id+ "'></div>";
		parameters['id'] = id;
		return {
			'presentation' :html ,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : true,
			'compile':false
		};
    }
};
Appcelerator.Widget.loadWidgetCommonCSS("app:ext_tree","extjs/xtheme-gray.css");
Appcelerator.Widget.loadWidgetCommonCSS("app:ext_tree","extjs/ext-all.css");
Appcelerator.Widget.registerWidgetWithCommonJS('app:ext_tree',Appcelerator.Widget.AppExtTree,["extjs/ext-base.js","extjs/ext-all.js"]);