Object.extend(Array.prototype,
{
	remove: function(obj) 
	{
  		var a = [];
  		for (var i=0; i<this.length; i++)
		{
    		if (this[i] != obj) 
			{
      			a.push(this[i]);
    		}
  		}
  		return a;
	}
});