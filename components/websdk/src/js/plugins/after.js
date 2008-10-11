$.fn.after = function(t,f)
{
	var time = App.timeFormat(t);
	var scope = this;
	setTimeout(function()
	{
		f.call(scope);
	},time);
	return this;
};
