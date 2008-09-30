
Appcelerator.Model = Class.create(Appcelerator.Observer,{__modelObject:Prototype.K});

Appcelerator.Model.isModel = function(obj)
{
	return obj && Object.isFunction(obj.__modelObject);
};

Appcelerator.Model.TreeModel = Class.create(Appcelerator.Model,
{
	initialize:function(d)
	{
		this.data = {};
		this.rootNodes =[];
		this.flattenData(d,null);
	},	
	isLeaf:function(id)
	{
		return (this.getChildCount(id) == 0);
	},
	getRootNodes: function()
	{
		return this.rootNodes;
	},
	getChildCount: function(id)
	{
		return (this.data[id] && this.data[id].children)?this.data[id].children.length:0;
	},
	getChildren: function(id)
	{
		return (this.data[id] && this.data[id].children)?this.data[id].children:[];
	},
	getParentId: function(id)
	{
		var d= this.data[id];
		var p = (d)?d['parent']:null;
		return p;
	},
	addNode:function(parentId,index,node)
	{
		var parent = this.data[parentId];
		if (!parent)return;
				
		// add to parent
		
		// first child
		if (!parent.children.length)
		{
			parent.children = [];
			parent.children[0] = node;
		}
		else
		{
			// do we already have this child
			var childExists = false;
			for (var i=0; i<parent.children.length;i++)
			{
				if (parent.children[i].id == node.id)
				{
					childExists = true;
					break;
				}
			}
			// if not, then add
			if (childExists == false)
			{
				// last child
				if (parent.children.length <= index)
				{
					parent.children[parent.children.length] = node;
				}
				// in the middle
				else
				{
					var currentLength = parent.children.length
					for (var i=currentLength;i>index;i--)
					{
						parent.children[i] = parent.children[i-1];
					}
					parent.children[index] = node;
				}	
			}
		}
		
		// add to stack
		this.data[node.id] = node;
		this.data[node.id]['parent']=parentId;
		if (parentId == null)
		{
			this.rootNodes.push(node);
		}
		
	},
	getNode:function(id)
	{
		return (this.data[id] != null)?this.data[id]:null
	},
	removeNode:function(id)
	{
		// remove children
		var children = (this.data[id] && this.data[id].children)?this.data[id].children:[];
		children.splice(0,children.length)
	
		// remove from parent if exists
		var parent = this.data[this.data[id].parent];
		if (parent)
		{
			for (var i=0;i<parent.children.length;i++)
			{
				if (parent.children[i].id == id)
				{
					parent.children.splice(i,1);
					break;
				}
			}
		}
		
		if (this.data[id].parent == null)
		{
			// TODO REMOVE NODE
		}
		
		// remove object
		this.data[id] = null;
		
	},
	updateNode:function(id,node)
	{
		if (!this.data[id])return;

		// delete node's individual children
		if (this.data[id].children)
		{
			for (var i=0;i<this.data[id].children.length;i++)
			{
				var child = this.data[id].children[i];
				if (this.data[child.id])
					this.data[child.id]=null;
			}
		}
		// update the node
		// NOTE: the node's index isn't touched in this case
		this.data[id] = node;
		
		// add node's new children to this.data
		if (node.children)
		{
			for (var i=0;i<node.children.length;i++)
			{
				var child = node.children[i];
				this.data[child.id] = child;
				this.data['parent'] = id;
			}
		}
	},
	flattenData:function(data,parentId)
	{
		for (var i=0;i<data.length;i++)
		{
			var node = data[i];
			this.data[node.id] = node;
			this.data[node.id]['parent'] = parentId;
			if (parentId == null)
			{
				this.rootNodes.push(this.data[node.id]); 
			}
			
			if (node.children)
			{
				this.flattenData(node.children,node.id)
			}
		}
	}
	
});

Appcelerator.Model.HTMLTreeModel = Class.create(Appcelerator.Model.TreeModel,
{
	
	flattenData:function(childNodes,parentId)
	{
		for (var i=0;i<childNodes.length;i++)
		{
			var node = childNodes[i];
			// only process DIVs
			if (node.nodeType == 1 && node.tagName.toUpperCase() == 'DIV')
			{
				var nodeData = {};
				
				// replicate attributes and store by name
				var attrs = (node.attributes)?node.attributes:[]
				for (var j=0;j<attrs.length;j++)
				{
					var value = node.getAttribute(attrs[j].name);
					if (value=="true")value=true;
					else if(value=="false")value=false;
					
					nodeData[attrs[j].name] = value;
				}
				
				// store innerHTML as attribute
				nodeData['html'] = node.innerHTML.trim();
				
				// record data
				this.data[node.id] = nodeData;
				this.data[node.id]['parent'] = parentId;
				
				// if we are a child - store children
				if (parentId != null)
				{
					if (!this.data[parentId].children)
					{
						this.data[parentId].children = [];
					}
					this.data[parentId].children[this.data[parentId].children.length] = nodeData;
	
				}
				else
				{
					this.rootNodes.push(this.data[node.id]); 
				}
								
				// if we have children - process
				if (node.childNodes.length > 0)
				{
					this.flattenData(node.childNodes,node.id);
				}

			}
		}
		
	}
});

Appcelerator.Model.TableModel = Class.create(Appcelerator.Model,{
	
	initialize:function(data)
	{
		this.data=data;
	},
	getRowCount:function()
	{
		return this.data ? ( Object.isArray(this.data) ? this.data.length : 1 ) : 0;
	},
	getRow: function(idx)
	{
		return this.data ? ( Object.isArray(this.data) ? this.data[idx] : this.data ) : null;
	}
});

Appcelerator.Model.RemoteTableModel = Class.create(Appcelerator.Model.TableModel,
{
	initialize: function(type,rowprop)
	{
		this.type = type;
		this.rowProperty = rowprop;
	    Appcelerator.Util.ServiceBroker.addListener(this);
	},
    accept: function ()
    {
        if (Object.isArray(this.type))
        {
            return this.type;
        }
        return [this.type];
    },
    acceptScope: function (scope)
    {
        return true;
    },
    onMessage: function (type,msg,datatype,from,scope)
    {
        try
        {
            this.data = Object.getNestedProperty(msg,this.rowProperty);
			this.fireEvent('modelChange');
        }
        catch(e)
        {
			//FIXME
        }
    }
});
