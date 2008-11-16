var oldPub = App.pubQueue;
var lastPubType = null, lastPubData = null;

// re-define to allow us to remember the last message and data payload
// for a publish so we can assert against it
App.pubQueue = function(name,data,local,scope,version)
{
	var type = (local ? 'local' : 'remote') + ':' + name;
	switch(type)
	{
		case 'local:app.compiled':
		case 'remote:appcelerator.status.report':
		{
			// we don't track these
			break;
		}
		default:
		{
			lastPubType = type;
			lastPubData = data;
			break;
		}
	}
	return oldPub.apply(this,arguments);
};

AppC.getLastQueue = function()
{
	return {
		name:lastPubType,
		data:lastPubData
	};
};
