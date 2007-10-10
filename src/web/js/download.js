
$MQL('appcelerator.download',function(type,msg,datatype,from)
{
		var name = msg['name'];
		var ticket = msg['ticket'];
		var d = Appcelerator.ServerConfig['download'];
		var url = d ? d.path : Appcelerator.DocumentPath + '/download';
		var id = Appcelerator.Util.UUID.generateNewId();
		url = url+'?ticket='+encodeURIComponent(ticket)+'&name='+encodeURIComponent(name)+'&reqid='+id;
		var html = '<iframe id="'+id+'" src="' + url + '" height="1" width="1" style="position:absolute;left:-400px;top:-400px;height:1px;width:1px;"></iframe>';
		new Insertion.Bottom(document.body,html);	
});
