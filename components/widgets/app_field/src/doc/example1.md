Title: Simple Example

This is a simple example that uses the `<app:field>`.
	
	<style>
	.test
	{
		background-color:#ffffcc;
		border:1px solid #ccc;
		padding:7px;
		color:#333;
		width:50%;
	}
	.result
	{
		border:1px solid #ccc;
		background-color:#f6f6f6;
		padding:7px;
		width:50%;
	}

		.my_active
		{
			background-color:#f6f6f6;
			border:1px solid #999;
		}
		.my_inactive
		{
			border:1px solid #aaa;
		}
		.my_field_active
		{
			background-color:blue;
			color:white;
		}
		.my_field_inactive
		{
			background-color:pink;

		}
		.my_header
		{
			font-size:15px;
			font-weight:bold;
			color:red;
		}
		.my_footer
		{
			font-size:11px;
			color:#ff9900;
		}
		#field_example input[type=text]:focus
		{
			background-color:#fff;
		}
		#field_example select:focus
		{
			background-color:#fff;
		}
		#field_example img
		{
			position:relative;
			top:3px;
		}

	</style>
Basic Field (text)
	<app:field validator="required" type="text">
		<header>
			Name:
		</header>
		<footer>
			fill it out, you dig?
		</footer>
	</app:field>

Field (custom error)
	<app:field validator="required" type="text">
		<header>
			Name:
		</header>
		<error>
			this is my custom error
		</error>
		<footer>
			fill it out, you dig?
		</footer>
	</app:field>

Field (drop down populate via message)
	<app:field validator="required" type="dropdown" message="l:populate.field"
		property="rows" value="id" text="text">
		<header>
			Name:
		</header>
		<error>
			this is my custom error
		</error>
		<footer>
			fill it out, you dig?
		</footer>
	</app:field>
	<app:message name="l:populate.field" args="{'rows':[{'id':'','text':'select a value'},{'id':1,'text':'value 2'},{'id':2,'text':'value 3'}]}">
	</app:message>

Field (autocomplete with delay and indicator)
	<app:field  type="autocomplete" autocomplete="l:autocomplete.search"
	delay="1000ms" indicator="auto_indicator">
		<header>
			Search:
			<span id="auto_indicator" on="l:autocomplete.search then show or l:autocomplete.response then hide"
				style="font-size:11px;color:#999;display:none">Searching...</span>
		</header>
		<footer>
			fill it out, you dig?
		</footer>
	</app:field>
	<app:script on="l:autocomplete.search then execute after 1s">
		$MQ('l:autocomplete.response');
	</app:script>

Field (styled - but not well)
	<app:field  type="text" activeClassName="my_active" inactiveClassName="my_inactive" fieldInactiveClassName="my_field_inactive" fieldActiveClassName="my_field_active" >
		<header class="my_header">
			Name:
		</header>
		<footer class="my_footer">
			fill it out, you dig?
		</footer>
	</app:field>