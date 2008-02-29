Title: Simple Example

This is a simple example that uses the `<app:datacache>`.
	
	<script>
		var count = 0;
		var count1 = 0;
	</script>

	<!-- datacache with auto-refresh -->
	<app:datacache request="l:get.data.request" keepAlive="30000" autoRefresh="true" response="l:get.data.response">
	</app:datacache>

	<!-- script widget that increments count on every request
		this should only get executed every 30 seconds since
		the datacache widget is intercepting the requests
	 -->
	<app:script on="l:get.data.request then execute">
		count++;
		$MQ('l:get.data.response',{'result':count});
	</app:script>

	<!-- this message does not have a datacache defined for it 
		so it will get executed each time the request is made -->
	<app:script on="l:get.data.request2 then execute">
		count1++;
		$MQ('l:get.data.response2',{'result':count1});
	</app:script>
	
