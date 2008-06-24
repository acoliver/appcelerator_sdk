Title: Simple Example

This is a simple example that uses the `<app:datacache>`.
	
++example
Result <span on="l:datacache.response then value[result]"></span>

<script>
	var count = 0;
</script>

<!-- datacache with auto-refresh -->
<app:datacache request="l:datacache.request" keepAlive="5000" autoRefresh="true" response="l:datacache.response"></app:datacache>

<!-- script widget that increments count on every request
	this should only get executed every 5 seconds since
	the datacache widget is intercepting the requests
 -->
<app:script on="l:datacache.request then execute">
	count++;
	$MQ('l:datacache.response',{'result':count})
</app:script>

<app:message name="l:datacache.request"></app:message>
--example