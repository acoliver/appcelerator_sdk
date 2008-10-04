
var subs = {local:[], remote:[]};
var re = /^(l|local|both|r|remote|\*)\:(.*)$/;
var localRe = /^l|local|both|\*/;
var pubdebug = AppC.params['debug'];
var queue = [];
var remoteDisabled = true;

$.fn.sub = function(name,fn,params)
{
	var type = name;
	var regexp = null;
	var idx = type.indexOf('[');
	
	if (idx > 0)
	{
		type = type.substring(0,idx);
	}
	
	var m = re.exec(type);
	type = m[2];
	if (type.charAt(0)=='~')
	{
		type = type.substring(1);
		regexp = new RegExp(type);
	}
	
	$.debug('subscribing '+m[2]+', local='+m[1]+', type='+type+', regexp='+regexp);
	
	if (localRe.test(m[1]))
	{
		subs.local.push({scope:this,fn:fn,name:type,params:params,regexp:regexp});
	}
	else
	{
		subs.remote.push({scope:this,fn:fn,name:type,params:params,regexp:regexp});
	}
	return this;
};

$.fn.pub = function(name,data,scope,version)
{
	var m = re.exec(name);
	var isLocal = localRe.test(m[1]);
	
	data = data || {};

	if (isLocal && !data.source) data.source = $(this).attr('id');

	if (pubdebug) $.info('publish '+name+' with '+$.toJSON(data));

 	queue.push({
		data:data||{},
		name:m[2],
		local:isLocal,
		scope:scope,
		version:version
	});

	if (remoteDisabled)
	{
		processQueue();		
	}

	return this;
};

$.fn.after = function(fn,delay)
{
	var scope = this;
	setTimeout(function(){ 
		fn.call(scope);
	},(delay||0.1));
	return this;
};

App.regCond(re,function(meta)
{
	$(this).sub(meta.cond,function(data)
	{
		$.info('trigger action called with '+$(this).attr('id')+', data='+$.toJSON(data));
		App.triggerAction(this,data,meta);
	});
});

App.regAction(/^(l|local|both|\*|r|remote)\:/,function(params,action)
{
	$(this).pub(action,params);
});

function deliverRemoteMessages(msgs)
{
	$.debug('remote messages received = '+$.toJSON(msgs));
	$.each(msgs,function()
	{
		var msg = this;
		$.each(subs.remote,function()
		{
			if ((this.regexp && this.regexp.test(msg.name)) || (!this.regexp && this.name == msg.name))
			{
				this.fn.apply(this.scope,[msg.data,msg.scope,msg.version]);
			}
		});
	});
}

var instanceid = AppC.params.instanceid || App.MD5.hex_md5(String(new Date().getTime()) + String(Math.round(9999*Math.random())));

function getServiceURL()
{
    var token = App.MD5.hex_md5(sessionCookie + instanceid);
    return serviceBroker + "?instanceid="+instanceid+'&auth='+token+'&ts='+String(new Date().getTime());
}

var marshallers={};
var currentRequestId = 0;

marshallers['xml/json']=function(q)
{
    var requestid = currentRequestId++;
	var xml = '';
    var time = new Date;
    var timestamp = time.getTime();
    xml = "<?xml version='1.0' encoding='UTF-8'?>\n";
    var tz = time.getTimezoneOffset()/60;
    var idleMs = 0;
    xml += "<request version='1.0' idle='" + idleMs + "' timestamp='"+timestamp+"' tz='"+tz+"'>\n";
	$.each(q,function()
	{
	    xml += "<message requestid='" + requestid + "' type='" + this.name + "' datatype='JSON' scope='"+(this.scope||'appcelerator')+"' version='"+(this.version||'1.0')+"'>";
	    xml += '<![CDATA[' + $.toJSON(this.data) + ']]>';
	    xml += "</message>";
	});
	xml += '</request>';
	
	$.ajax({
		type:'POST',
		url:getServiceURL(),
		data:xml,
		cache:false,
		dataType:'xml',
		contentType:'text/xml',
		success:function(xml)
		{
	        var children = xml.documentElement.childNodes;
	        if (children && children.length > 0)
	        {
	            var msgs = [];
	            for (var c = 0; c < children.length; c++)
	            {
	                var child = children.item(c);
	                if (child.nodeType == 1)
	                {
	                    var requestid = child.getAttribute('requestid');
                        var type = child.getAttribute('type');
                        var datatype = child.getAttribute('datatype');
                        var scope = child.getAttribute('scope') || 'appcelerator';
                        var text = $.domText(child);
                        var data = $.evalJSON(text);
						msgs.push({
							name:type,
							data:data,
							datatype:datatype,
							scope:scope,
							requestid:requestid
						});
	                }
	            }
				deliverRemoteMessages(msgs);
	        }
		}
	});
};

marshallers['application/json']=function(q)
{
    var requestid = this.currentRequestId++;
    var request = {};
    var time = new Date;
	var json = {
		timestamp: time.getTime()  + (time.getTimezoneOffset()*60*1000),
		version: '1.0', //protocol version
		messages: []
	};
	
    for (var c = 0,len = q.length; c < len; c++)
    {
		var e = q[c];
		json.messages.push({
			type: e.name,
			data: e.data,
			version: e.version,
			scope: e.scope
		});
    }

	$.ajax({
		type:'POST',
		url:getServiceURL(),
		data:$.toJSON(json),
		cache:false,
		dataType:'json',
		contentType:'application/json',
		success:function(result)
		{
	        var msgs = [];
	        for (var c = 0; c < result.messages.length; c++)
	        {
                var message = result.messages[c];
                var type = message.type
                var datatype = message.datatype;
                var scope = message.scope || 'appcelerator';
                var data = message.data;
                message.datatype = 'JSON'; // always JSON
                msgs.push({
					name:type,
					data:data,
					datatype:datatype,
					scope:scope
				});
	        }
			deliverRemoteMessages(msgs);
		}
	});
};

function remoteDelivery(q)
{
	if (!remoteDisabled) marshaller(q);
}

function processQueue()
{
	if (queue.length < 1) return;
	
	var rq = remoteDisabled ? null : [];
	$.each(queue,function()
	{
		var a = this.local ? subs.local : subs.remote;
		var name = this.name;
		var data = this.data;
		var scope = this.scope;
		var version = this.version;
		$.each(a,function()
		{
			$.debug('name='+name+',regexp='+this.regexp+',this.name='+this.name);
			if ((this.regexp && this.regexp.test(name)) || (!this.regexp && this.name == name))
			{
				if (App.parseConditionCondition(this.params,data))
				{
					this.fn.apply(this.scope,[data,scope,version]);
				}
			}
		});
		if (!this.local && !remoteDisabled) rq.push({name:name,data:data,scope:scope,version:version});
	});

	if (rq && rq.length > 0) remoteDelivery(rq);
	
	// clear the queue
	queue = [];
}

var queueTimer;
var serviceBroker;
var marshaller;
var sessionCookie;

function startDelivery(config)
{
	$.debug('remote config => ' + $.toJSON(config));

	remoteDisabled = false;
	var sb = config.servicebroker;

	if (!sb || sb.disabled=='true')
	{
		remoteDisabled = true;
		$.info('Appcelerator remote services disabled');
		return;
	}
	serviceBroker = sb.value;
	if (!serviceBroker)
	{
		$.error("Error loading service broker! not specified in appcelerator.xml");
		remoteDisabled=true;
		return;
	}
	if (!remoteDisabled)
	{
		marshaller = marshallers[sb.marshaller];
		if (!marshaller)
		{
			$.error("Error loading marshaller = "+sb.marshaller);
			remoteDisabled=true;
			return;
		}
		
        var cookieName = config['sessionid'].value || 'unknown_cookie_name';
        var cookieValue = $.cookie(cookieName);
        
        if (!cookieValue)
        {
			$.ajax({
				type:'GET',
				url:serviceBroker,
				data:"initial=1",
				async:true,
				success:function()
				{
			        sessionCookie = $.cookie(cookieName);
					$.debug('sessionCookie = '+sessionCookie);
					queueTimer = setInterval(processQueue,10);
				}
			});
        }
		else
		{
			sessionCookie = cookieValue;
			$.debug('sessionCookie = '+sessionCookie);
			queueTimer = setInterval(processQueue,10);
		}
	}
}

//
// fetch our appcelerator.xml
//
try
{
	AppC.serverConfig = {};
	
	$.ajax({
		async:true,
		cache:true,
		dataType:'xml',
		type:'GET',
		url:AppC.docRoot+'appcelerator.xml',
		success:function(data)
		{
			var re = /@\{(.*?)\}/g;
			var map = {rootPath:AppC.docRoot};
			var children = data.documentElement.childNodes;
			for (var c=0;c<children.length;c++)
			{
				var child = children[c];
				if (child.nodeType == 1)
				{
					var service = child.nodeName.toLowerCase();
					var config = {};
					var path = $.domText(child);
					var template = AppC.compileTemplate(path,false,null,re);
					for (var x=0;x<child.attributes.length;x++)
					{
						var attr = child.attributes[x];
						config[attr.name]=attr.value;
					}
					config.value = template(map);
					AppC.serverConfig[service]=config;
				}
			}
			$(document).trigger('serverConfig',AppC.serverConfig);
			startDelivery(AppC.serverConfig);
		},
		error:function(xhr,text,error)
		{
			$.error('error retrieving appcelerator.xml, remote services are disabled. error = '+text);
		}
	});

}
catch(e)
{
	$.error('error loading appcelerator.xml, remote services are disabled. error = '+e);
}
