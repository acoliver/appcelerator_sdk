Object.extend(Array.prototype,
{
	remove: function(obj) 
	{
		var idx = this.indexOf(obj);
		if (idx != -1)
		{
			this.removeAt(idx);
		}
		return this;
	},
	removeAt: function(index)
	{
		if (-index > this.length) return; 
		return this.splice(index, 1)[0];
	}
});