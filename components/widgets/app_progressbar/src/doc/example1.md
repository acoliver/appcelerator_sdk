Title: Simple Example

This is a simple example that uses the `<app:progressbar>`.

++example	
<app:progressbar message="l:pb.set" property="value" width="100px" height="12px">
</app:progressbar>
<a on="click then l:pb.set[value=20]">Show me!</a>
--example
    
