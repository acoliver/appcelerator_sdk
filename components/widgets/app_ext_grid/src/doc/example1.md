Title: Simple Example

This is a simple example that uses the `<app:ext_grid>`.
	
	<app:ext_grid on="l:test2 then execute" 
			  property="rows" 
			  width="390"
			  title="My Grid Panel" 
			  selectMessage="l:row.select" 
			  autoExpandColumn="col6" autoScroll="false">
			<column property="col4" sortable="true" renderer="pctChange" width="130" >Col1</column>
			<column property="col5" sortable="true" width="130px" >Col2</column>
			<column property="col6" sortable="true" width="130px" >Col3</column>
		</app:ext_grid>


This examples uses a custom cell renderer.  Here's an example of how to write one:
	
	<script>
	function pctChange(val){
        if(val > 0){
            return '<span style="color:green;">' + val + '%</span>';
        }else if(val < 0){
            return '<span style="color:red;">' + val + '%</span>';
        }
        return val;
    }
	</script>

