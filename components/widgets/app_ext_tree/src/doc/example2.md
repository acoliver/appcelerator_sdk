Title: Programmatically Selecting a node

This is a simple example shows how to programmatically select a node:
	
	<app:ext_tree  on="l:test then execute or l:select then select" width="200px"
		property="rows" rootText="Site Map" draggable="true" droppable="true"
		sendDataMessage="l:sitemap.data" sendDataProperty="rows" height="300" >				
	</app:ext_tree>
	
    <app:message name="l:select" args="{'id': 1}"></app:message>

Use 'select\_no\_fire' if you do not want the tree to refire an event