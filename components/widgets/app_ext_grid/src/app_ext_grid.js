
Appcelerator.Widget.AppExtGrid =
{
    getName: function()
    {
        return 'appcelerator ext_grid';
    },
    getDescription: function()
    {
        return 'ExtJS Grid Panel made into an Appcelerator Widget';
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
        return 'http://www.appcelerator.org';
    },
    isWidget: function ()
    {
        return true;
    },
    getWidgetName: function()
    {
        return 'app:ext_grid';
    },
	getActions: function()
	{
		return ['execute'];
	},	

    getAttributes: function()
    {
		var T = Appcelerator.Types;
        return [{name: 'on', optional: false, description: "Used to show grid", type: T.onExpr},
				{name: 'property', optional: false, description: "array data property", type: T.identifier},
				{name: 'selectMessage', optional: true, description: "message to send on row selected", type: T.messageSend},
				{name: 'height', optional: true, defaultValue:200, description: "height of grid", type: T.number},
				{name: 'width', optional: true, defaultValue:200, description: "width of grid", type: T.number},
				{name: 'stripeRows', optional: true, defaultValue:true, description: "alternate row color", type: T.bool},
				{name: 'frame', optional: true, defaultValue:false, description: "place a border frame around grid", type: T.bool},
				{name: 'autoExpandColumn', optional: true, description: "column to expand to take up excess width"},
				{name: 'title', optional: true, description: "grid title"}

		];
    },
	compileWidget: function(params) 
	{
		// build store
		var record = Ext.data.Record.create(params['properties']);
		var jsonReader = new Ext.data.JsonReader({root:params['property']},record);
		var store = new Ext.data.Store({reader:jsonReader});
		
		// build grid options
		var options={};
		options['store'] = store;
		options['columns'] = params['columns'];		
		options['frame'] = (params['frame'] == "true")?true:false;
		options['stripeRows'] = (params['stripeRows'] == "true")?true:false;
		options['renderTo'] = params['id'],
		options['width'] = params['width'];
		options['title'] = params['title'];
		options['height'] = params['height'];

		options['fitToFrame'] = true;

		if (params['autoExpandColumn'])
		{
			options['autoExpandColumn'] = params['autoExpandColumn'];
		}
		// create the grid
	    var grid = new Ext.grid.GridPanel(options);
	
		// store the datastore
		params['store'] = store;
		
		// if row selection message, setup listener
		if (params['selectMessage'])
		{
			grid.getSelectionModel().on('rowselect', 
				function(model,idx,data) {
					var payload = {};
					payload['rowidx'] = idx;
					for (var i=0;i<params['properties'].length;i++)
					{
						payload["'"+params['properties'][i].name+"'"] = data.get(params['properties'][i].name);
					}
					$MQ(params['selectMessage'],payload);
				}
			);
		}
	},

	execute: function(id,params,data,scope)
	{
		params['store'].loadData(data,false);

	},

    buildWidget: function(element,parameters)
    {
		var id = Appcelerator.Compiler.generateId();
		var html = "<div id='"+ id+ "'></div>";
		parameters['id'] = id;
 
      	var columns = [];
		var properties = [];
        if (Appcelerator.Browser.isIE)
        {
            // NOTE: in IE, you have to append with namespace
            var newhtml = element.innerHTML;
            newhtml = newhtml.replace(/<COLUMN/g,'<APP:COLUMN');
            newhtml = newhtml.replace(/\/COLUMN>/g,'/APP:COLUMN>');
            element.innerHTML = newhtml;
        }
        
        for (var c=0,len=element.childNodes.length;c<len;c++)   
        {
            var child = element.childNodes[c];
            if (child.nodeType == 1 && child.nodeName.toLowerCase() == 'column')
            {
                var propRow = {};
				var colRow = {};
				
				// do property row
				propRow['name'] = child.getAttribute('property');
				propRow['type'] = (child.getAttribute('type') == null)?'string':child.getAttribute('type');				
				properties.push(propRow);
				
				// do column row
				if (parameters['autoExpandColumn'] == propRow['name'])
				{
					colRow['id'] = propRow['name'];
				}
				colRow['header'] = child.innerHTML;
                colRow['width'] = (child.getAttribute('width')==null)?100:parseInt(child.getAttribute('width'));
				colRow['sortable'] = (child.getAttribute('sortable')=="true")?true:false;
				colRow['dataIndex'] = propRow['name'];
				
				if (child.getAttribute('renderer'))
				{
					colRow['renderer'] = window[child.getAttribute('renderer')];
				}
				columns.push(colRow);
				
            }
        }
		parameters['columns'] = columns;
		parameters['properties'] = properties;
		
		return {
			'presentation' :html ,
			'position' : Appcelerator.Compiler.POSITION_REPLACE,
			'parameters': parameters,
			'wire' : true,
			'compile':true
		};
    }
};
Appcelerator.Widget.loadWidgetCommonCSS("app:extgrid","extjs/xtheme-gray.css");
Appcelerator.Widget.loadWidgetCommonCSS("app:ext_grid","extjs/ext-all.css");
Appcelerator.Widget.registerWidgetWithCommonJS('app:ext_grid',Appcelerator.Widget.AppExtGrid,["extjs/ext-base.js","extjs/ext-all.js"]);