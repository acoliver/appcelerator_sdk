Title: Simple Example

This is a simple example that uses the `<app:validation>`.
	
Required Date:

++example
<input type="text" validator="date" decorator="date" id="date"/>
--example 

Optional Email:

++example
<input type="text" validator="email_optional" decorator="email" id="email"/>
--example

Required  (at least 1 character):

++example
<input type="text" validator="required" decorator="required" id="required_field"/>
--example

Optional Number  (decimal > 0):

++example
<input type="text" validator="number_optional" decorator="number" id="number"/>
--example

Custom Decorator:

++example
<input type="text" validator="required" decorator="custom" decoratorId="my_custom_decorator" id="custom"/>
<span id="my_custom_decorator" style="color:green;font-size:16px">wrong answer, pal...</span>
<span on="l:validation.test[valid=true] then show else hide" style="color:green;display:none">
	All Fields Valid
</span>
<span on="l:validation.test[valid=false] then show else hide" style="color:red;display:none">
	1 or more Fields Invalid
</span>
<app:validation on="valid then l:validation.test[valid=true] else l:validation.test[valid=false]">
	<members>
		 date email required_field number custom
	</members>
</app:validation>
--example
