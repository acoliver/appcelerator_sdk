$.fn.trash = function(fn)
{
	var trash = this.data('trash');
	if (!trash)
	{
		trash = [];
		this.data('trash',trash);
	}
	if (arguments.length == 0 || typeof(fn)=='undefined')
	{
		return trash;
	}
	trash.push(fn);
	return this;
};

$.fn.destroy = function()
{
	var scope = $(this);
	$.each(this,function()
	{
		var trash = $(this).trash();
		if (trash && trash.length > 0)
		{
			$.each(trash,function()
			{
				try { this.call(scope) } catch (E) { } 
			});
		}
		$(this).removeData('trash');
	});
	return this;
};

var oldEmpty = $.fn.empty;

// remap to make sure we destroy
$.fn.empty = function()
{
	var set = getTargetCompileSet(this,true);
	$.each(set,function()
	{
		$(this).destroy();
	});
	return oldEmpty.apply(this,arguments);
};

var oldRemove = $.fn.remove;

// remap to make sure we destroy
$.fn.remove = function()
{
	$.each(this,function()
	{
		var scope = $(this);
		scope.destroy();
		oldRemove.call(scope);
	});
	return this;
};

