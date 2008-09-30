Appcelerator.Observer=Class.create(
{
	observeAll: function(callback)
	{
		if (!this.allListeners)
		{
			this.allListeners = [];
		}
		this.allListeners.push(callback);
	},
	unEvent: function(eventName,callback)
	{
		if (this.listeners)
		{
			var listeners = this.listeners[eventName];
			var found = -1;
			for (var c=0;c<listeners.length;c++)
			{
				if (listener[c] == callback)
				{
					found = c;
					break;
				}
			}
			if (found != -1)
			{
				listeners.removeAt(found);
				return true;
			}
		}
		return false;
	},
	onEvent: function(eventName,callback)
	{
		if (!this.listeners)
		{
			this.listeners = [];
		}
		var listeners = this.listeners[eventName];
		if (!listeners)
		{
			listeners = [];
			this.listeners[eventName]=listeners;
		}
		if (Object.isFunction(callback))
		{
			var obj = {};
			var evt = 'on'+eventName.charAt(0).toUpperCase()+eventName.substring(1);
			obj[evt]=callback;
			listeners.push(obj);
		}
		else
		{
			listeners.push(callback);
		}
	},
	fireEvent: function(event,data)
	{
		if (!this.listeners && !this.allListeners) return;
		
		var eventName = 'on'+event.charAt(0).toUpperCase()+event.substring(1);
		var eventObject = 
		{
			event: event,
			source : this,
			data: data
		};
		
		if (this.listeners)
		{
			var observers = this.listeners[event];

			if (observers && observers.length > 0)
			{
				for (var c=0;c<observers.length;c++)
				{
					var observer = observers[c];
					var method = observer[eventName];
					if (method)
					{
						method.call(observer,eventObject);
					}
				}
			}
		}
		if (this.allListeners)
		{
			for (var c=0;c<this.allListeners.length;c++)
			{
				var observer = this.allListeners[c];
				observer(eventObject);
			}
		}
	}
});
