Appcelerator.Util.ServiceBroker = 
{
    DEBUG:false,
    init:false,
    instanceid:Appcelerator.instanceid,
    serverPath: Appcelerator.DocumentPath + "servicebroker",
    interceptors: [],
    messageQueue: [],
    initQueue:[],
    timer: null,
    time: null,
    currentRequestId:1,
    serverDown: false,
    poll: false,
    fetching: false,
    localDirectListeners: {},
    remoteDirectListeners: {},
    localPatternListeners: [],
    remotePatternListeners: [],
    devmode: (window.location.href.indexOf('devmode=1') > 0),
    disabled: this.devmode || (window.location.href.indexOf('file:/') == 0) || Appcelerator.Parameters['mbDisabled']=='1',
	remoteDisabled: this.disabled || Appcelerator.Parameters['remoteDisabled']=='1',

    toString: function ()
    {
        return '[ServiceBroker]';
    },

    addInterceptor: function (interceptor)
    {
     	$D(this.toString() + ' Adding interceptor: ' + interceptor);
        this.interceptors.push(interceptor);
    },

    removeInterceptor: function (interceptor)
    {
        $D(this.toString() + 'Removing interceptor: ' + interceptor);
        this.interceptors.remove(interceptor);
    },

	convertType: function (t)
	{
		if (t.startsWith('l:')) return t.replace(/^l:/,'local:');
		if (t.startsWith('r:')) return t.replace(/^r:/,'remote:');
		return t;
	},

    addListenerByType: function (t, callback)
    {
        t = this.convertType(t.trim());
        // note: don't use split since regex has :
        var idx = t.indexOf(':');
        var direction = (idx != -1) ? (t.substring(0, idx)) : 'both';
        var type = (idx != -1) ? t.substring(idx + 1) : t;
        var regex = type.charAt(0) == '~';

        if (direction == 'local' || direction == 'both')
        {
            var array = null;
            if (regex)
            {
                this.localPatternListeners.push([callback,new RegExp(type.substring(1))]);
                var removePatternListenerArrays = callback['_removePatternListenerArrays'];
                if (!removePatternListenerArrays)
                {
                    removePatternListenerArrays = [];
                    callback['_removePatternListenerArrays'] = removePatternListenerArrays;
                }
                removePatternListenerArrays.push(this.localPatternListeners);
            }
            else
            {
                array = this.localDirectListeners[type];
                if (!array)
                {
                    array = [];
                    this.localDirectListeners[type] = array;
                }
                var removeListenerArrays = callback['_removeListenerArrays'];
                if (!removeListenerArrays)
                {
                    removeListenerArrays = [];
                    callback['_removeListenerArrays'] = removeListenerArrays;
                }
                removeListenerArrays.push(array);
                array.push(callback);
            }
        }
        if (direction == 'remote' || direction == 'both')
        {
            var array = null;
            if (regex)
            {
                this.remotePatternListeners.push([callback,new RegExp(type.substring(1))]);
                var removePatternListenerArrays = callback['_removePatternListenerArrays'];
                if (!removePatternListenerArrays)
                {
                    removePatternListenerArrays = [];
                    callback['_removePatternListenerArrays'] = removePatternListenerArrays;
                }
                removePatternListenerArrays.push(this.remotePatternListeners);
            }
            else
            {
                array = this.remoteDirectListeners[type];
                if (!array)
                {
                    array = [];
                    this.remoteDirectListeners[type] = array;
                }
                var removeListenerArrays = callback['_removeListenerArrays'];
                if (!removeListenerArrays)
                {
                    removeListenerArrays = [];
                    callback['_removeListenerArrays'] = removeListenerArrays;
                }
                removeListenerArrays.push(array);
                array.push(callback);
            }
        }
    },

    addListener: function (callback)
    {
        var startTime = new Date().getTime();

        var accept = callback['accept'];
        if (!accept)
        {
            alert('add listener problem, callback incorrect and has no accept function\n' + callback);
            return;
        }
        var types = accept.call(callback);
        if (types.length == 1)
        {
            this.addListenerByType(types[0], callback);
        }
        else
        {
            for (var c = 0, len = types.length; c < len; c++)
            {
                this.addListenerByType(types[c], callback);
            }
        }
        if (this.DEBUG) $D(this.toString() + ' Added listener: ' + callback + ' (' + (new Date().getTime() - startTime) + ' ms)');
    },
    removeListener: function (callback)
    {
        var startTime = new Date().getTime();
        var removeListenerArrays = callback['_removeListenerArrays'];
        if (removeListenerArrays && removeListenerArrays.length > 0)
        {
            for (var c = 0,len = removeListenerArrays.length; c < len; c++)
            {
                removeListenerArrays[c].remove(callback);
            }
            delete callback['_removeListenerArrays'];
        }
        var removePatternListenerArrays = callback['_removePatternListenerArrays'];
        if (removePatternListenerArrays && removePatternListenerArrays.length > 0)
        {
            for (var c = 0,len = removePatternListenerArrays.length; c < len; c++)
            {
                var array = removePatternListenerArrays[c];
                if (array && array.length > 0)
                {
                    var found = null;
                    for (var x = 0, xlen = array.length; x < xlen; x++)
                    {
                        var e = array[x];
                        if (e[0] == callback)
                        {
                            found = e;
                            break;
                        }
                    }
                    if (found) array.remove(found);
                }
            }
        }
        if (this.DEBUG) $D(this.toString() + ' Removed listener: ' + callback + ' (' + (new Date().getTime() - startTime) + ' ms)');
    },
    triggerComplete:function()
    {
    	this.compileComplete = true;
    	this.runInitQueue();
    },
    triggerConfig:function()
    {
    	this.configComplete = true;
    	this.runInitQueue();
    },
    runInitQueue:function()
    {
    	// we need both of these conditions to be true before we can complete initialization
    	if (this.compileComplete && this.configComplete)
    	{
    		this.init = true;
	    	if (this.initQueue && this.initQueue.length > 0)
	    	{
	    		for (var c=0;c<this.initQueue.length;c++)
	    		{
	    			this.queue(this.initQueue[c][0],this.initQueue[c][1]);
	    		}
	    		this.initQueue = null;
	    	}
    	}
    },
	/**
	 * enqueue an event into the broker
	 *
	 * the msg must contain a 'type' property
	 * which is in the format:
	 *
	 * [destination:message_type]
	 *
	 * where destination is either:
	 *
	 * local - deliver the message to client listeners (don't go to the server)
	 * remote - deliver the message to the server
	 *
	 *
	 * callback is an optional method to be called if the server responds with
	 * the same requestid
	 */
    queue: function (msg, callback)
    {
    	if (!Appcelerator.Util.ServiceBroker.init)
    	{
    		$D(msg.type+' will be queued, not yet initialized');
    		this.initQueue.push([msg,callback]);
    		return;
    	}
    	
        var type = msg['type'];

        if (!type)
        {
            throw "type must be specified on the message";
        }

		type = this.convertType(type);
		
		var scope = msg['scope'] || 'appcelerator';
		var version = msg['version'] || '1.0';

        // let the interceptors have at it
        if (this.interceptors.length > 0)
        {
            var send = true;
            for (var c = 0, len = this.interceptors.length; c < len; c++)
            {
                var interceptor = this.interceptors[c];
                var func = interceptor['interceptQueue'];
                if (func)
                {
                    var result = func.apply(interceptor, [msg,callback,type,scope,version]);
                    if (this.DEBUG) $D(self.toString() + ' Invoked interceptor: ' + interceptor + ', returned: ' + result + ' for message: ' + type);
                    if (result != null && !result)
                    {
                        send = false;
                        break;
                    }
                }
            }

            if (!send)
            {
                // allow the interceptor the ability to squash it
                $D(this + ' interceptor squashed event: ' + msg['type']);
                return;
            }
        }

        var a = type.indexOf(':');

        var dest = a != -1 ? type.substring(0, a) : 'local';
        var name = a != -1 ? type.substring(a + 1) : type;

        // replace the destination
        msg['type'] = name;

        var data = (msg['data']) ? msg['data'] : {};

        var json = null;
        switch (typeof(data))
        {
            case 'object':
            case 'array':
                json = Object.toJSON(data);
                break;
            default:
                json = data.toString();
                break;
        }
        data.toString = function()
        {
            return json;
        };

        $D(this + ' message queued: ' + name + ', data: ' + json+', version: '+version+', scope: '+scope);

        switch (dest)
        {
            case 'remote':
            {
                // send remote
                if (this.messageQueue)
                {
                	  // in devmode, we don't actually send remote events
                	  if (!this.devmode && !this.remoteDisabled)
                	  {
	                    // place in the outbound message queue for delivery
	                    this.messageQueue.push([msg,callback,scope,version]);
	
	                    // the remote message can be forced to be sent immediate
	                    // by setting this property, otherwise, it will be queued
	                    this.startTimer(msg['immediate'] || false);
	                 }
                }
                else
                {
                    $E(this + ' message:' + name + " ignored since we don't have a messageQueue!");
                }
                var arraydirect = this.remoteDirectListeners[name];
                var arraypattern = this.remotePatternListeners;
                if (arraydirect)
                {
                    for (var c = 0, len = arraydirect.length; c < len; c++)
                    {
                        this.sendToListener(arraydirect[c], name, data, 'JSON', dest, scope, version);
                    }
                }
                if (arraypattern)
                {
                    for (var c = 0, len = arraypattern.length; c < len; c++)
                    {
                        var entry = arraypattern[c];
                        var listener = entry[0];
                        var pattern = entry[1];
                        if (pattern.test(name))
                        {
                            this.sendToListener(listener, name, data, 'JSON', dest, scope, version);
                        }
                    }
                }
                break;
            }
            case 'local':
            {
                var arraydirect = this.localDirectListeners[name];
                var arraypattern = this.localPatternListeners;

                if (arraydirect)
                {
                    for (var c = 0, len = arraydirect.length; c < len; c++)
                    {
                        this.sendToListener(arraydirect[c], name, data, 'JSON', dest, scope, version);
                    }
                }
                if (arraypattern)
                {
                    for (var c = 0, len = arraypattern.length; c < len; c++)
                    {
                        var entry = arraypattern[c];
                        var listener = entry[0];
                        var pattern = entry[1];
                        if (pattern.test(name))
                        {
                            this.sendToListener(listener, name, data, 'JSON', dest, scope, version);
                        }
                    }
                }

                break;
            }
        }
    },

    processIncoming: function (xml)
    {
        if (xml)
        {
            var children = xml.documentElement.childNodes;
            if (children && children.length > 0)
            {
                for (var c = 0; c < children.length; c++)
                {
                    var child = children.item(c);
                    if (child.nodeType == Appcelerator.Util.Dom.ELEMENT_NODE)
                    {
                        var requestid = child.getAttribute("requestid");
                        try
                        {
                            this.dispatch(requestid, child);
                        }
                        catch (e)
                        {
                            $E(this + ' - Error in dispatch of message. ' + Object.getExceptionDetail(e));
                        }
                    }
                }
            }
        }
    },
    
    dispatch: function (requestid, msg)
    {
        var type = msg.getAttribute("type");
        var datatype = msg.getAttribute("datatype");
        var scope = msg.getAttribute("scope") || 'appcelerator';

        var data = msg;

        if (datatype == 'JSON')
        {
            var text;
            try
            {
                text = Appcelerator.Util.Dom.getText(msg);
                data = text.evalJSON();
                data.toString = function ()
                {
                    return Object.toJSON(this);
                };
                $D(this.toString() + ' received remote message, type:' + type + ',data:' + data);
            }
            catch (e)
            {
                $E('Error received evaluating: ' + text + ' for ' + msg + ', type:' + type + ", " + Object.getExceptionDetail(e));
                return;
            }
        }

        // let the interceptors have at it
        if (this.interceptors.length > 0)
        {
            var send = true;
            for (var c = 0, len = this.interceptors.length; c < len; c++)
            {
                var interceptor = this.interceptors[c];
                var func = interceptor['interceptDispatch'];
                if (func)
                {
                    var result = func.apply(interceptor, [requestid,type,data,datatype,scope]);
                    if (result != null && !result)
                    {
                        send = false;
                        break;
                    }
                }
            }

            if (!send)
            {
                // allow the interceptor the ability to squash it
                return;
            }
        }

        var array = this.remoteDirectListeners[type];
        if (array && array.length > 0)
        {
            for (var c = 0, len = array.length; c < len; c++)
            {
                this.sendToListener(array[c], type, data, datatype, 'remote', scope);
            }
        }
        if (this.remotePatternListeners.length > 0)
        {
            for (var c = 0,len = this.remotePatternListeners.length; c < len; c++)
            {
                var entry = this.remotePatternListeners[c];
                var listener = entry[0];
                var pattern = entry[1];
                if (pattern.test(type))
                {
                    this.sendToListener(listener, type, data, datatype, 'remote', scope);
                }
            }
        }
    },
    sendToListener: function (listener, type, msg, datatype, from, scope)
    {
        // let the interceptors have at it
        if (this.interceptors.length > 0)
        {
            var send = true;
            for (var c = 0, len = this.interceptors.length; c < len; c++)
            {
                var interceptor = this.interceptors[c];
                var func = interceptor['interceptSendToListener'];
                if (func)
                {
                    var result = func.apply(interceptor, [listener,type,msg,datatype,from,scope]);
                    if (result != null && !result)
                    {
                        send = false;
                        break;
                    }
                }
            }

            if (!send)
            {
                // allow the interceptor the ability to squash it
                return;
            }
        }
        
        //
        // check the scope function before we continue
        //
        var scopeCheckFunc = listener['acceptScope'];
        if (scopeCheckFunc)
        {
        	if (!scopeCheckFunc(scope))
        	{
        		return;
        	}
        }
        
        $D(this.toString() + ' forwarding ' + type + ' to ' + listener + ', direction:' + from + ', datatype:' + datatype + ', data: ' + msg);
        try
        {
            listener['onMessage'].apply(listener, [type,msg,datatype,from,scope]);
        }
        catch (e)
        {
            $E("Unhandled Exception dispatching:" + type + ", " + msg + ", to listener:" + listener + ", " + Object.getExceptionDetail(e));
        }
        return true;
    },

    XML_REGEXP: /^<(.*)>$/,

    deliver: function (initialrequest)
    {
        var xml = null;

        if (this.messageQueue == null)
        {
            // we're dead and destroyed, cool, just
            // return silently
            $E(this.toString()+', deliver called but no message queue');
            return;
        }
		if (this.remoteDisabled)
		{
			// remote disabled
            return;
		}
		
        // send	if we have stuff
        var time = new Date();
        var timestamp = time.getTime();
        if (this.messageQueue.length > 0)
        {
            xml = "<?xml version='1.0'?>\n";
			var tz = time.getTimezoneOffset()/60;
            var idleMs = Appcelerator.Util.IdleManager.getIdleTimeInMS();
            xml += "<request version='1.0' idle='" + idleMs + "' timestamp='"+timestamp+"' tz='"+tz+"'>\n";
            for (var c = 0,len = this.messageQueue.length; c < len; c++)
            {
                var msg = this.messageQueue[c];
                var requestid = this.currentRequestId++;
                var scope = msg[2];
                var version = msg[3];
                var datatype = 'JSON';
                var data = msg[0]['data'];
                xml += "<message requestid='" + requestid + "' type='" + msg[0]['type'] + "' datatype='" + datatype + "' scope='"+scope+"' version='"+version+"'>";
                xml += '<![CDATA[' + Object.toJSON(data) + ']]>';
                xml += "</message>";
            }
            this.messageQueue.clear();
            xml += "</request>";
        }
		// get the auth token
		var cookieName = Appcelerator.ServerConfig['sessionid'].value||'JSESSIONID';
		var authToken = Appcelerator.Util.Cookie.GetCookie(cookieName);
		// calculate the token we send back to the server
		var token = (authToken) ? Appcelerator.Util.MD5.hex_md5(authToken+this.instanceid) : '';
        var _method = (xml == null) ? 'get' : 'post';
        var p = (initialrequest && xml == null) ? "?maxwait=1&initial=1&instanceid="+this.instanceid : "?maxwait=" + ((!initialrequest && xml) ? this.maxWaitPollTime : this.maxWaitPollTimeWhenSending)+"&instanceid="+this.instanceid+'&auth='+token+'&ts='+timestamp;

        Logger.trace(this.toString() + ' Sending (poll=' + (this.poll) + '): ' + (xml || '<empty>'));

        this.fetching = true;
  		this.sendRequest(p,_method,xml,0)
	},
	sendRequest: function(p,_method,xml,count)
	{
		count = count++;

		if (count > 3)
		{
			$E('too many attempts sending a re-authorization request.');
			return;
		}
		
		var self = this;
		
        new Ajax.Request(this.serverPath + p,
        {
            asynchronous: true,
            method: _method,
            postBody: xml || "",
            contentType: 'text/xml',
            onComplete: function()
            {
                self.fetching = false;
            },
            onSuccess: function (result)
            {
                setTimeout(function()
                {
	                self.fetching = false;
	                self.startTimer(false);
	
	                if (result && result.status)
	                {
	                    if (result.status == 401)
	                    {
	                        self.onServiceBrokerInvalidLogin();
	                        return;
	                    }
	                    // 204 is no content, in which case the content-type is text/plain
	                    if (result.status != 204 && result.status != 202)
	                    {
	                        var contentType = result.getResponseHeader('Content-type');
	                        // do indexOf instead of equals since we sometime tack on the character encoding
	                        if (!contentType || contentType.indexOf('text/xml') == -1)
	                        {
	                            // this most likely means we've been redirected on the
	                            // server to another page or something, in which case
	                            // we (default) will just go to the landing page
	                            self.onServiceBrokerInvalidContentType(contentType);
	                            return;
	                        }
	                    }
	                    if (self.serverDown)
	                    {
	                        self.serverDown = false;
	                        var downtime = new Date().getTime() - self.serverDownStarted;
	                        if (Logger.infoEnabled) Logger.info('[' + Appcelerator.Util.DateTime.get12HourTime(new Date(), true, true) + '] ' + self.toString() + ' Server is UP at ' + self.serverPath);
	                        self.queue({type:'local:appcelerator.servicebroker.server.up',data:{path:this.serverPath,downtime:downtime}});
	                    }
	                    if (result.status == 200)
	                    {
	                        var skip = false;
	                        var cl = result.getResponseHeader("Content-Length");
	                        if (cl && cl == "0")
	                        {
	                            // this is OK, just means no messages from the other side
	                            skip = true;
	                            $D(self.toString() + ' Receiving no messages on response');
	                        }
	                        if (!skip)
	                        {
	                            // now process them
	                            $D('[' + Appcelerator.Util.DateTime.get12HourTime(new Date(), true, true) + '] ' + self.toString() + ' Receiving: ' + result.responseText);
	                            self.processIncoming(result.responseXML);
	                        }
	                    }
	                }
	
	                // 204 is no content, which is OK
	                // 503 is service unavailable, which we handle already
	                if (result && result.status && result.status != 200 && result.status != 503 && result.status != 204 && result.status != 202)
	                {
	                    $E(self.toString() + ' Response Failure: ' + result.status + ' ' + result.statusText);
	                }
	
                },0);
            },
            onFailure: function (transport, json)
            {
            	if (transport.status == 400)
            	{
                    var cl = transport.getResponseHeader("X-Failed-Retry");
                    if (!cl)
                    {
                    	Logger.warn("Failed authentication, will retry 1 more time");
			  			self.sendRequest(p+"&retry=1",_method,xml,count);
			  			return;
                    }
            	}
				if (transport.status == 406)
				{
			  		self.sendRequest(p,_method,xml,count);
					return;
				}
                self.fetching = false;
                if (transport.status >= 500 || transport.status == 404)
                {
                    self.serverDown = true;
                    self.serverDownStarted = new Date().getTime();
                    Logger.warn(self.toString() + ' Server is DOWN at ' + self.serverPath);
                    self.queue({type:'local:appcelerator.servicebroker.server.down',data:{path:self.serverPath}});
                }
                else
                {
                    $E(self.toString() + ' Failure: ' + transport.status + ' ' + transport.statusText);
                }

                // restart the timer
                self.startTimer(false);
            },
            onException: function (resp, ex)
            {
                var msg = new String(ex);
                var log = true;
                var restartTimer = true;
                self.fetching = false;

                if (msg.indexOf("NS_ERROR_NOT_AVAILABLE") != -1 && msg.indexOf("nsIXMLHttpRequest.status") != -1)
                {
                    // this is a firefox exception when you call status on the XMLHttpRequest object when
                    // the backend closed the connection, such as in a logout situation.. you can safely
                    // ignore this
                    log = false;
                }
                if (msg.indexOf("NS_ERROR_FILE_NOT_FOUND") != -1)
                {
                    // we might be running local for example
                    restartTimer = false;
                }

                if (log)
                {
                    $E(self.toString() + ' Exception: ' + msg);
                }

                if (restartTimer)
                {
                    // restart timer
                    self.startTimer(false);
                }
            }
        });
    },

    destroy: function ()
    {
        this.cancelTimer();
        if (this.messageQueue) this.messageQueue.clear();
        this.messageQueue = null;
        this.time = null;
        if (this.localDirectListeners)
        {
            for (var p in this.localDirectListeners)
            {
                var a = this.localDirectListeners[p];
                if (typeof(a) == 'array')
                {
                    a.clear();
                }
            }
            this.localDirectListeners = null;
        }
        if (this.remoteDirectListeners)
        {
            for (var p in this.remoteDirectListeners)
            {
                var a = this.remoteDirectListeners[p];
                if (typeof(a) == 'array')
                {
                    a.clear();
                }
            }
            this.remoteDirectListeners = null;
        }
        if (this.localPatternListeners) this.localPatternListeners.clear();
        this.localPatternListeners = null;
        if (this.remotePatternListeners) this.remotePatternListeners.clear();
        this.remotePatternListeners = null;
    },

    cancelTimer: function ()
    {
        if (this.timer)
        {
            clearTimeout(this.timer);
            this.timer = 0;
        }
    },

    onServiceBrokerInvalidContentType: function (type)
    {
        // the default is to redirect to the landing page, but you
        // can set this to do something different if you want
        if (Logger.fatalEnabled) Logger.fatal(this + ', received an invalid content type ('+(type||'none')+'), probably need to re-login, redirecting to landing page');
    },

    onServiceBrokerInvalidLogin: function ()
    {
        // the default is to redirect to the landing page, but you
        // can set this to do something different if you want
        if (Logger.fatalEnabled) Logger.fatal(this + ', received an invalid credentials, probably need to re-login, redirecting to landing page');
    },

    startTimer: function (force)
    {
    	if (!this.init)
    	{
    	  	// make sure we've initialized
    	  	$D(this.toString()+' - startTimer called but not running yet');
    		return;
    	}
    	
    	if (this.disabled)
    	{
    		return;
    	}
    	
        // stop the existing timer
        this.cancelTimer();

        // queue could be destroyed
        if (this.messageQueue)
        {
            if (!this.poll)
            {
                if (this.messageQueue.length > 0 && !this.fetching)
                {
                    this.emptyQueueHits = 0;
                    this.deliver(true);
                    return;
                }
                return;
            }
            if (force && !this.fetching)
            {
                this.emptyQueueHits = 0;
                this.deliver(force);
                return;
            }
            // determine how long we've been waiting
            // so on a rapid succession of messages we
            // starve the timer and never send
            var now = new Date().getTime();
            if (this.time)
            {
                // ok, too long, go ahead and send if we have something
                // in the queue
                if (this.messageQueue.length > 0 && now - this.time >= 150 && !this.fetching)
                {
                    this.emptyQueueHits = 0;
                    this.deliver(false);
                    return;
                }
            }
            // start our inactive timer, and fire it even if we
            // don't have messages so we can get messages coming
            // to us
            this.time = now;
            var self = this;
            var qtime = this.downServerPoll;
            if (!this.serverDown)
            {
                if (this.messageQueue.length > 1)
                {
                    qtime = this.moreThanOneEntryQueuePoll;
                    this.emptyQueueHits = 0;
                }
                else
                {
                    if (this.messageQueue.length > 0)
                    {
                        qtime = this.oneEntryQueuePoll;
                        this.emptyQueueHits = 0;
                    }
                    else
                    {
                        // use a backoff decay as we continue to poll with empty messages such that the longer we poll with no data
                        // the longer we wait between polls - this somewhat ensures that the more active we are, the faster we are
                        // polling and the less active, the slower - but with the ability to reset and get faster as we start sending
                        // more messages
                        qtime = Math.min(this.emptyQueuePollMax, this.emptyQueuePoll + (this.emptyQueueHits * this.emptyQueueDecay));
                        this.emptyQueueHits++;
                    }
                }
            }
            this.timer = setTimeout(function()
            {
                if (!self.fetching)
                {
                    self.deliver(false);
                }
            }, qtime);
        }
        else
        {
        	$E(toString() + ' startTimer called and we have no message queue');
        }
    },
    maxWaitPollTime: 200,   /*how long to poll the message queue on the server */
    maxWaitPollTimeWhenSending:0, /* how long to poll the message queue on the server when we're sending data */
    moreThanOneEntryQueuePoll: 50, /* how long to wait before sending when we have >1 entry in our send queue */
    oneEntryQueuePoll: 200, /* how long to wait before sending when we have one entry in our send queue */
    emptyQueuePoll: 2000, /* how long to wait before polling when we have an empty queue */
    emptyQueuePollMax: 30000, /* max time we are willing wait before polling */
    emptyQueueDecay: 500, /* how long to decay in ms when we have an empty queue */
    emptyQueueHits: 0, /* use this as the decay multiplier */
    downServerPoll: 10000 /* when the server is down, how long to wait before retrying */
};


//
// convenience macro for doing a message queue request
//
function $MQ (type,data,scope,version)
{
	Appcelerator.Util.ServiceBroker.queue({
		type: type,
		data: data || {},
		scope: scope,
		version: version || '1.0'
	});
}

//
// convenience macro for adding a message queue listener
//
function $MQL (type,f,myscope,element)
{
	var listener = 
	{
		accept: function ()
		{
			if (typeof(type)=='array')
			{
				return type;
			}
			return [type];
		},
		acceptScope: function (scope)
		{
			if (myscope)
			{
				return myscope == '*' || scope == myscope;
			}
			return true;
		},
		onMessage: function (type,msg,datatype,from,scope)
		{
			f.apply(f,[type,msg,datatype,from,scope]);
		}
	};
	
	Appcelerator.Util.ServiceBroker.addListener(listener);

	if (element)
	{
		Appcelerator.Compiler.addTrash(element,function()
		{
			Appcelerator.Util.ServiceBroker.removeListener(listener);
		});
	}

	return listener;
}

Appcelerator.Util.ServiceBrokerInterceptor = Class.create();
/**
 * ServiceBrokerInterceptor interceptor prototype class
 */
Object.extend(Appcelerator.Util.ServiceBrokerInterceptor.prototype, {

    initialize: function ()
    {
    },

    toString: function ()
    {
        return '[Appcelerator.Util.ServiceBrokerInterceptor]';
    },

    interceptQueue: function (msg, callback)
    {
        return true;
    },

    interceptDispatch: function (requestid, type, data, datatype)
    {
        return true;
    },

    interceptSendToListener: function (listener, type, msg, datatype)
    {
        return true;
    }
});

if (Appcelerator.Util.ServiceBroker.disabled || Appcelerator.Util.ServiceBroker.remoteDisabled)
{
	Appcelerator.Util.ServiceBroker.triggerConfig();
	Logger.warn('[ServiceBroker] remote delivery of messages is disabled');
}
else
{
	Appcelerator.Util.ServerConfig.addConfigListener(function()
	{
		var config = Appcelerator.ServerConfig['servicebroker'];
		if (!config || config['disabled']=='true')
		{
			Appcelerator.Util.ServiceBroker.disabled = true;
			Appcelerator.Util.ServiceBroker.remoteDisabled = true;
			Appcelerator.Util.ServiceBroker.triggerConfig();
			Logger.warn('[ServiceBroker] remote delivery of messages is disabled');
			return;
		}
		Appcelerator.Util.ServiceBroker.serverPath = config.value;
		Appcelerator.Util.ServiceBroker.poll = (config.poll == 'true');
        Appcelerator.Util.ServiceBroker.triggerConfig();
        Appcelerator.Util.ServiceBroker.startTimer();
        Logger.info('ServiceBroker ready');
	});
	
	//
	// if being loaded from an IFrame - don't do the report
	//
	if (window.parent == null || window.parent == window)
	{
		var screenHeight = screen.height;
		var screenWidth = screen.width;
		var colorDepth = screen.colorDepth || -1;

		/**
		 * if autoReportStats is set (default), we are going to send a status 
		 * message to the server with our capabilities and some statistics info
		 */
		Appcelerator.Core.onload(function()
		{
			if (Appcelerator.Browser.autoReportStats)
			{
				var platform = Appcelerator.Browser.isWindows ? 'win' : Appcelerator.Browser.isMac ? 'mac' : Appcelerator.Browser.isLinux ? 'linux' : Appcelerator.Browser.isSunOS ? 'sunos' : 'unknown';
				var data = 
				{
					'userAgent': navigator.userAgent,
					'flash': Appcelerator.Browser.isFlash,
					'flashver': Appcelerator.Browser.flashVersion,
					'screen': {
						'height':screenHeight,
						'width':screenWidth,
						'color':colorDepth
					 },
					'os': platform,
					'referrer': document.referrer,
					'path': window.location.href,
					'cookies' : (document.cookie||'').split(';').collect(function(f){ var t = f.split('='); return t && t.length > 0 ? {name:t[0],value:t[1]} : {name:null,value:null}})
				};
				$MQ('remote:appcelerator.status.report',data);
			}
		});
	}
}

Appcelerator.Core.onunload(Appcelerator.Util.ServiceBroker.destroy.bind(Appcelerator.Util.ServiceBroker));
Appcelerator.Compiler.afterDocumentCompile(function()
{
	Appcelerator.Util.ServiceBroker.triggerComplete();
});

