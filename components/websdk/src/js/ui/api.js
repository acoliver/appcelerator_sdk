Appcelerator.UI = {};
Appcelerator.UI.elementMap = {};
Appcelerator.UI.UIListeners = {};

// define public API namespace
var AppC = {};

//
// Get an instance of a control that is already
// declared
//
AppC.getControl = function(id,type,callback)
{
	AppC.registerListener('control', type, 'afterBuild', function()
	{
		if (Appcelerator.UI.elementMap[id + "_control_" + type])
		{
			callback.apply(Appcelerator.UI.elementMap[id + "_control_" + type].inst)
		}
	});
};


//
// Create a control from existing markup
//
(function()
{
	jQuery.fn.createControl = function(type,args,callback)
	{
		return this.each(function()
		{
				Appcelerator.loadUIManager('control',type,this,args||{},true,callback);
		})
	}
})(jQuery);

//
//  Register UI Event Listeners
//
AppC.registerListener = function(type,name,event,callback)
{
	var f = function()
	{
		if (this.name == name || name == '*')
		{
			if ((this.event == event || event == '*') && (this.type == type) && (this.name == name)) 
			{
				var scope = this.data || {};
				scope.type = this.type;
				scope.name = this.name;
				scope.event = this.event;
				callback.call(scope);
			}
		}
	};
	var listeners = Appcelerator.UI.UIListeners[type];
	if (!listeners)
	{
		listeners=[];
		Appcelerator.UI.UIListeners[type] = listeners;
	}
	listeners.push(f);
};

// Appcelerator.UI.createControl = function (element,type,args,callback)
// {
// 	Appcelerator.loadUIManager('control',type,element,args||{},true,callback);
// };
// 
// Appcelerator.UI.addBehavior = function(element,type,args,callback)
// {
// 	Appcelerator.loadUIManager('behavior',type,element,args||{},true,callback);
// };
// 
// Appcelerator.UI.createLayout = function(element,type,args,callback)
// {
// 	Appcelerator.loadUIManager('layout',type,element,args||{},true,callback);
// };
