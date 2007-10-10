
Appcelerator.History = {};

Appcelerator.History.currentURL = null;

Appcelerator.History.onTimer = function()
{
	if (top.location.hash!=null && Appcelerator.History.currentURL!=top.location.hash)
	{
		var old = Appcelerator.History.currentURL;
		Appcelerator.History.currentURL = top.location.hash;
		
		if (Logger.debugEnabled) Logger.debug('history change = '+old+', new = '+Appcelerator.History.currentURL);
		
		if (Appcelerator.History.changeListeners && Appcelerator.History.changeListeners.length > 0)
		{
			var oldHash = old ? old.substring(1) : null;
			var newHash = top.location.hash ? top.location.hash.substring(1) : null;
			
			for (var c=0;c<Appcelerator.History.changeListeners.length;c++)
			{
				var listener = Appcelerator.History.changeListeners[c];
				listener(oldHash,newHash);
			}
		}
	}	
};

Appcelerator.History.changeListeners = [];

Appcelerator.History.onChange = function(listener)
{
	Appcelerator.History.changeListeners.push(listener);	
};

Appcelerator.History.go = function(historyToken)
{
	window.location.hash = historyToken;
};

Appcelerator.History.getLocation = function()
{
	return Appcelerator.History.currentURL ? Appcelerator.History.currentURL.substring(1) : null;
}

Appcelerator.Core.onload(function()
{
	if (Appcelerator.Browser.isIE)
	{
		// since we delay the compile we need to delay this
		setTimeout(Appcelerator.History.onTimer,10);	
	}
	else
	{
		Appcelerator.History.onTimer();
	}
	Appcelerator.History.timer = setInterval(Appcelerator.History.onTimer,50);	
});


