Title: Simple Example

This is a simple example that uses the `<app:security>`.
	
	<app:security on="l:loaded then execute">
		return (this.data.roles && this.data.roles[0].r == this.roles[0]);
	</app:security>
	<div security="r">This value should be visible</div>
	<div security="w">This value should NOT be visible</div>
	<app:script>
		$MQ('l:loaded',{roles:[{'r':'r'}]});
	</app:script>
	