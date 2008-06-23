Title: Simple Example

This is a simple example that uses the `<app:modalbox>`.
	
Modalbox (basic)

++example
<input type="button" on="click then l:test1" value="Run Test"/>
<app:modalbox on="l:test1 then execute" title="Modalbox title goes here">
	<html:div>If you see this modal box drop down from the top, the test passed. You should see a date below:</html:div>
	<html:div style="margin-top:40px;"><html:span id="c1"></html:span></html:div>
	<script>
		$('c1').innerHTML=new Date();
	</script>
</app:modalbox>
--example
