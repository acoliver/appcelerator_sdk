Title: Simple Example

This is a simple example that uses the `<app:ext_tree>`.

++example	
<app:ext_tree  on="l:test then execute or l:save then senddata" width="200px"
	property="rows" rootText="Site Map" draggable="true" droppable="true"
	sendDataMessage="l:sitemap.data" sendDataProperty="rows" height="300" >				
</app:ext_tree>

<app:script style="display: none">
$MQ('l:test',{'rows':[
	{'text':'item 1', 'id':1, 'expandable':false,'leaf':true,'children':null},
	{'text':'item 2', 'id':2, 'expandable':false,'leaf':true,'children':null},
	{'text':'item 3', 'id':3, 'expandable':false,'leaf':true,'children':null},
	{'text':'item 4', 'id':4, 'expandable':false,'leaf':true,'children':null}
]});
</app:script>
--example

The tree uses the model provided by ExtJS. 

The "text" attribute is the text that will be displayed for the tree node.    
The "id" attribute is the unique identifier for the tree node.  This must be unique across all nodes 
in the tree.
The "expandable" attribute determines whether the + or - icons are displayed for the node
The "children" attribute should be null or it should be an array of children tree nodes that follow the 
same model (i.e., text, id, expandable, and children)

\*Note\* Care should be taken to ensure that all nodes ahve a unique id.  Unique id's will be assigned
automatically if no id parameter is provided.