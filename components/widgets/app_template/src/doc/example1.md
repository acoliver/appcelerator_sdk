Title: Simple Example

This is a simple example that uses the `<app:template>`.


In the example below, the Header and the Footer come from a template, but the Body of the template is overriden:

++example
<style>
.my_body
{
	height:100px;
	background-color:#fff;
	color:#666;
	border-right:1px solid #ccc;
	border-left:1px solid #ccc;
	padding:20px;

}
.specials
{
	margin:10px;
	padding:5px;
	border:1px dashed #ccc;
	background-color:#ffffcc;
	color:#333;
}
</style>

<app:template src="widgets/app_template/doc/template.html">
	<html:div id="template_body">
		<html:div class="my_body">
			<html:div class="bold_value" style="margin-bottom:5px">Welcome </html:div>
			Today's Specials
			<html:div class="specials">50% off InterWeb Machines  </html:div>
			<html:div class="specials">2006 Canyonerro SUV - $12</html:div>
		</html:div>
	</html:div>
</app:template>
--example