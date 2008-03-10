Appcelerator.Util.ServiceBroker = 
{
    DEBUG:false,
    init:false,
    instanceid:Appcelerator.instanceid,
    serverPath: Appcelerator.DocumentPath + "servicebroker",
    interceptors: [],
    messageQueue: [],
	localMessageQueue: [],
	localTimer: null,
	localTimerPoll: 10,
    initQueue:[],
    timer: null,
    time: null,
    serverDown: false,
    poll: false,
    fetching: false,
    localDirectListeners: {},
    remoteDirectListeners: {},
    localPatternListeners: [],
    remotePatternListeners: [],
    devmode: (window.location.href.indexOf('devmode=1') > 0),
    disabled: this.devmode || (window.location.href.indexOf('file:/') == 0) || Appcelerator.Parameters.get('mbDisabled')=='1',
	remoteDisabled: this.disabled || Appcelerator.Parameters.get('remoteDisabled')=='1',
	marshaller:'xml/json',
	transport:'appcelerator',
	multiplex:true,

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
		this.startLocalTimer();
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

		if(Logger.debugEnabled)
		{
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
			$D(this + ' message queued: ' + name + ', data: ' + json+', version: '+version+', scope: '+scope);
		}

		if(dest == 'remote')
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
		}
		this.localMessageQueue.push([name,data,dest,scope,version]);
	},
    dispatch: function (msg)
    {
		var requestid = msg.requestid;
        var type = msg.type;
        var datatype = msg.datatype;
        var scope = msg.scope;
        var data = msg.data;

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
                    var result = func.apply(interceptor, [requestid,type,msg,datatype,scope]);
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
		var stat = Appcelerator.Util.Performance.createStat();

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
		Appcelerator.Util.Performance.endStat(stat,type,"remote");

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
		var stat = Appcelerator.Util.Performance.createStat();
        try
        {
            listener['onMessage'].apply(listener, [type,msg,datatype,from,scope]);
        }
        catch (e)
        {
            $E("Unhandled Exception dispatching:" + type + ", " + msg + ", to listener:" + listener + ", " + Object.getExceptionDetail(e));
        }
		Appcelerator.Util.Performance.endStat(stat,type,from);
        return true;
    },

    XML_REGEXP: /^<(.*)>$/,

    deliver: function (initialrequest)
    {
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

		// get the marshaller to use
		var marshaller = Appcelerator.Util.ServiceBrokerMarshaller[this.marshaller];
		if (!marshaller)
		{
			$E(this+' - no marshaller defined, will not send message to remote endpoint');
			this.remoteDisabled = true;
			return;
		}
		var transportHandler = Appcelerator.Util.ServiceBrokerTransportHandler[this.transport];
		if (!transportHandler)
		{
			$E(this+' - no transport handler defined, will not send message to remote endpoint');
			this.remoteDisabled = true;
			return;
		}
		
		this.fetching = true;
		
		var payloadObj = marshaller.serialize(this.messageQueue,this.multiplex);
		var payload = payloadObj.postBody;
		var contentType = payloadObj.contentType;
	
		var instructions = transportHandler.prepare(this,initialrequest,payload,contentType);

		if (this.multiplex)
		{
			this.messageQueue.clear();
		}
		else
		{
			if (this.messageQueue.length > 0)
			{
				this.messageQueue.removeAt(0);
			}
		}

		var url = instructions.url;
		var method = instructions.method;
		var postBody = instructions.postBody;
		var contentType = instructions.contentType;

		this.sendRequest(url,method,postBody,contentType,marshaller);
		
		if (!this.multiplex && this.messageQueue.length > 0)
		{
			this.deliver.defer();
		}
	},
	sendRequest: function(url,method,body,contentType,marshaller,count)
	{
	    count = (count || 0) + 1;
	    
		if (count > 3)
		{
		  $E('failed to send request too many times to '+url);
		  return;
		}
        var self = this;
		
        new Ajax.Request(url,
        {
            asynchronous: true,
            method: method,
            postBody: body,
            contentType: contentType,
			evalJSON:false,
			evalJS:false,
            onComplete: function()
            {
                self.fetching = false;
            },
            onSuccess: function (result)
            {
                (function()
                {
	                self.fetching = false;
	                self.startTimer(false);
	
					if (result && result.status && result.status >= 200 && result.status < 300)
					{
	                    if (self.serverDown)
	                    {
	                        self.serverDown = false;
	                        var downtime = new Date().getTime() - self.serverDownStarted;
	                        if (Logger.infoEnabled) Logger.info('[' + Appcelerator.Util.DateTime.get12HourTime(new Date(), true, true) + '] ' + self.toString() + ' Server is UP at ' + self.serverPath);
	                        self.queue({type:'local:appcelerator.servicebroker.server.up',data:{path:this.serverPath,downtime:downtime}});
	                    }

                        var cl = parseInt(result.getResponseHeader("Content-Length") || '1');
						var contentType = result.getResponseHeader('Content-Type') || 'unknown';
						
                        if (cl > 0)
                        {
							var msgs = marshaller.deserialize(result,parseInt(cl),contentType);
							if (msgs && msgs.length > 0)
							{
								for (var c=0;c<msgs.length;c++)
								{
		                            self.dispatch(msgs[c]);
								}
							}
						}
					}
                }).defer();
            },
            onFailure: function (transport, json)
            {
            	if (transport.status == 400)
            	{
                    var cl = transport.getResponseHeader("X-Failed-Retry");
                    if (!cl)
                    {
                        Logger.warn("Failed authentication");
			  			return;
                    }
            	}
				if (transport.status == 406)
				{
			  		self.sendRequest(url,method,body,contentType,marshaller,count);
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
		this.cancelLocalTimer();
        if (this.messageQueue) this.messageQueue.clear();
        if (this.localMessageQueue) this.localMessageQueue.clear();
        this.messageQueue = null;
        this.time = null;
        if (this.localDirectListeners)
        {
            for (var p in this.localDirectListeners)
            {
                var a = this.localDirectListeners[p];
                if (Object.isArray(a))
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
                if (Object.isArray(a))
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

    cancelLocalTimer: function ()
    {
        if (this.locaTimer)
        {
            clearInterval(this.locaTimer);
            this.locaTimer = 0;
        }
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

    startLocalTimer: function ()
    {		
		this.localTimer = setInterval(function()
        {
			var queue = this.localMessageQueue; 
			if (queue && queue.length)
			{
				var message = queue[queue.length-1];
				var name = message[0];
				var data = message[1];
				var dest = message[2];
				var scope = message[3];
				var version = message[4];
				
				switch (dest)
				{
					case 'remote':
					{
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
						arraydirect = this.localDirectListeners[name];
						arraypattern = this.localPatternListeners;
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
				
				queue.remove(message);
			}
        }.bind(this), this.localTimerPoll);
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
			if (Object.isArray(type))
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
			try
			{
				f.apply(f,[type,msg,datatype,from,scope]);
			}
            catch(e)
            {
                Appcelerator.Compiler.handleElementException(element,e);
            }
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


Appcelerator.Util.ServiceBrokerMarshaller={};
Appcelerator.Util.ServiceBrokerMarshaller['xml/json'] = 
{
	currentRequestId:1,
	jsonify:function(msg)
	{
        var requestid = this.currentRequestId++;
        var scope = msg[2];
        var version = msg[3];
        var datatype = 'JSON';
        var data = msg[0]['data'];
        var xml = "<message requestid='" + requestid + "' type='" + msg[0]['type'] + "' datatype='" + datatype + "' scope='"+scope+"' version='"+version+"'>";
        xml += '<![CDATA[' + Object.toJSON(data) + ']]>';
        xml += "</message>";
		return xml;
	},
	serialize: function(messageQueue,multiplex)
	{
		var xml = null;
        if (messageQueue.length > 0)
        {
			xml = '';
	        var time = new Date();
	        var timestamp = time.getTime();
            xml = "<?xml version='1.0' encoding='UTF-8'?>\n";
			var tz = time.getTimezoneOffset()/60;
            var idleMs = Appcelerator.Util.IdleManager.getIdleTimeInMS();
            xml += "<request version='1.0' idle='" + idleMs + "' timestamp='"+timestamp+"' tz='"+tz+"'>\n";
			if (multiplex)
			{
	            for (var c = 0,len = messageQueue.length; c < len; c++)
	            {
					xml+=this.jsonify(messageQueue[c]);
	            }
			}
			else
			{
				xml+=this.jsonify(messageQueue[0]);
			}
            xml += "</request>";
        }
		return {
			'postBody': xml,
			'contentType':'text/xml;charset=UTF-8'
		};
	},
	deserialize: function(response,length,contentType)
	{
		if (response.status == 202)
		{
			return null;
		}
		if (contentType.indexOf('text/xml')==-1)
		{
			$E(this+', invalid content type: '+contentType+', expected: text/xml');
			return null;
		}
		var xml = response.responseXML;
		if (!xml)
		{
			return null;
		}
        var children = xml.documentElement.childNodes;
		var msgs = null;
        if (children && children.length > 0)
        {
			msgs = [];
            for (var c = 0; c < children.length; c++)
            {
                var child = children.item(c);
                if (child.nodeType == Appcelerator.Util.Dom.ELEMENT_NODE)
                {
                    var requestid = child.getAttribute("requestid");
                    try
                    {
				        var type = child.getAttribute("type");
				        var datatype = child.getAttribute("datatype");
				        var scope = child.getAttribute("scope") || 'appcelerator';
			            var data, text;
			            try
			            {
			                text = Appcelerator.Util.Dom.getText(child);
			                data = text.evalJSON();
			                data.toString = function () { return Object.toJSON(this); };
			            }
			            catch (e)
			            {
			                $E('Error received evaluating: ' + text + ' for type: ' + type + ", error: " + Object.getExceptionDetail(e));
			                return;
			            }
		                $D(this.toString() + ' received remote message, type:' + type + ',data:' + data);
						msgs.push({type:type,data:data,datatype:datatype,scope:scope,requestid:requestid});
                    }
                    catch (e)
                    {
                        $E(this + ' - Error in dispatch of message. ' + Object.getExceptionDetail(e));
                    }
                }
            }
        }
		return msgs;
	}
};

Appcelerator.Util.ServiceBrokerMarshaller['application/json'] = 
{
	currentRequestId:1,
	prepareMsg: function(msg)
	{
		var result = {};
		result['requestid'] = this.currentRequestId++;
		result['type'] = msg[0]['type'];
		result['scope'] = msg[2];
		result['version'] = msg[3];
		result['datatype'] = 'JSON';
		result['data'] = msg[0]['data'];
		return result;
	},
	serialize: function(messageQueue,multiplex)
	{
		var json = {};
        if (messageQueue.length > 0)
        {
			var request = {};

	        var time = new Date();
	        var timestamp = time.getTime();
			var tz = time.getTimezoneOffset()/60;
            var idleMs = Appcelerator.Util.IdleManager.getIdleTimeInMS();
			request['idle'] = idleMs;
			request['timestamp'] = timestamp;
			request['tz'] = tz;
			request['version'] = '1.0';

			request['messages'] = [];
			if (multiplex)
			{
	            for (var c = 0,len = messageQueue.length; c < len; c++)
	            {
					request['messages'].push(this.prepareMsg(messageQueue[c]));
	            }
			}
			else
			{
				request['messages'].push(this.prepareMsg(messageQueue[0]));
			}
			json['request'] = request;
        }
		return {
			'postBody': Object.toJSON(json),
			'contentType':'application/json'
		};
	},
	deserialize: function(response,length,contentType)
	{
		if (response.status == 202)
		{
			return null;
		}
		if (contentType.indexOf('application/json')==-1)
		{
			$E(this+', invalid content type: '+contentType+', expected: application/json');
			return null;
		}
		var msgs = [];
		var result = response.responseText.evalJSON();
        for (var c = 0; c < result['messages'].length; c++)
        {
			try
			{
				message = result['messages'][c];
				var requestid = message['requestid'];
				var type = message['type'];
				var datatype = message['datatype'];
				var scope = message['scope'] || 'appcelerator';
				var data = message['data'];
				$D(this.toString() + ' received remote message, type:' + type + ',data:' + data);
				msgs.push({type:type,data:data,datatype:datatype,scope:scope,requestid:requestid});
			}
			catch (e)
			{
			   $E(this + ' - Error in dispatch of message. ' + Object.getExceptionDetail(e));
			}
        }
		return msgs;
	}
};

function jsonParameterEncode (key, value, array)
{
	switch(typeof(value))
	{
		case 'string':
		case 'number':
		case 'boolean':
		{
			array.push(key+'='+encodeURIComponent(value));
			break;
		}
		case 'array':
		case 'object':
		{
			// check to see if the object is an array
			if (Object.isArray(value))
			{
				for (var c=0;c<value.length;c++)
				{
					jsonParameterEncode(key+'.'+c,value[c],array);
				}
			}
			else
			{
				for (var p in value)
				{
					jsonParameterEncode(key+'.'+p,value[p],array);
				}
			}
			break;
		}
		case 'function':
		{
			break;
		}
		default:
		{
			array.push(encodeURIComponent(key)+'=');
			break;
		}
	}
}

function jsonToQueryParams(json)
{
	var parameters = [];

	for (var key in json)
	{
		var value = json[key];
		jsonParameterEncode(key,value,parameters);
	}
	
	return parameters.join('&');
};

/**
 * given an element will encode the element and it's children to 
 * json
 */
function json_encode_xml (node,json)
{
   var obj = {};
   var found = json[node.nodeName];
   if (found)
   {
       if (Object.isArray(found))
       {
          found.push(obj);
       } 
       else
       {
          json[node.nodeName] = [found,obj];
       }
   }
   else
   {
       json[node.nodeName] = obj;
   }
 
   Appcelerator.Util.Dom.eachAttribute(node,function(name,value)
   {
       obj[name]=value;
   });
   var added = false;
   Appcelerator.Util.Dom.each(node.childNodes,Appcelerator.Util.Dom.ELEMENT_NODE,function(child)
   {
       json_encode_xml(child,obj);
       added = true;
   });
   if (!added)
   {
     var text = Appcelerator.Util.Dom.getText(node);
     json[node.nodeName] = text;
   }
}


/**
 * Form URL encoded service marshaller
 */
Appcelerator.Util.ServiceBrokerMarshaller['application/x-www-form-urlencoded'] = 
{
	currentRequestId:1,
	parameterize: function(msg)
	{
        var requestid = this.currentRequestId++;
        var scope = msg[2];
        var version = msg[3];
        var datatype = 'JSON';
        var data = msg[0]['data'];

		var str = '$messagetype='+msg[0]['type']+'&$requestid='+requestid+'&$datatype='+datatype+'&$scope='+scope+'&$version='+version;
		
		if (data)
		{
			str+='&' + jsonToQueryParams(data);
		}
		return str;
	},
	serialize: function(messageQueue,multiplex)
	{
		var xml = null;
        if (messageQueue.length > 0)
        {
			xml = '';
			if (multiplex)
			{
	            for (var c = 0,len = messageQueue.length; c < len; c++)
	            {
					xml+=this.parameterize(messageQueue[c]);
	            }
			}
			else
			{
				xml+=this.parameterize(messageQueue[0]);
			}
        }
		return {
			'postBody': xml,
			'contentType':'application/x-www-form-urlencoded;charset=UTF-8'
		};
	},
	deserialize: function(response,length,contentType)
	{
		if (response.status == 202)
		{
			return null;
		}
		if (contentType.indexOf('/json')==-1)
		{
			$E(this+', invalid content type: '+contentType+', expected json mimetype');
			return null;
		}
		return response.responseText.evalJSON(true);
	}
};

Appcelerator.Util.ServiceBrokerTransportHandler = {};

/**
 * Appcelerator based protocol transport handler
 */
Appcelerator.Util.ServiceBrokerTransportHandler['appcelerator'] = 
{
	prepare: function(serviceBroker,initialrequest,payload,contentType)
	{
		// get the auth token
		var cookieName = Appcelerator.ServerConfig['sessionid'].value||'JSESSIONID';
		var authToken = Appcelerator.Util.Cookie.GetCookie(cookieName);
		
		// calculate the token we send back to the server
		var token = (authToken) ? Appcelerator.Util.MD5.hex_md5(authToken+serviceBroker.instanceid) : '';
		
		// create parameters for URL
        var parameters = "?maxwait=" + ((!initialrequest && payload) ? serviceBroker.maxWaitPollTime : serviceBroker.maxWaitPollTimeWhenSending)+"&instanceid="+serviceBroker.instanceid+'&auth='+token+'&ts='+new Date().getTime();
		var url = serviceBroker.serverPath + parameters;
		var method = payload ? 'post' : 'get';
		
		return { 
			'url':url, 
			'method': method, 
			'postBody': payload||'', 
			'contentType':contentType 
		};
	}
};


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
		Appcelerator.Util.ServiceBroker.multiplex = config.multiplex ? (config.multiplex == 'true') : true;
		Appcelerator.Util.ServiceBroker.transport = config.transport || Appcelerator.Util.ServiceBroker.transport;
		Appcelerator.Util.ServiceBroker.marshaller = config.marshaller || Appcelerator.Util.ServiceBroker.marshaller;
		
		var cookieName = Appcelerator.ServerConfig['sessionid'].value || 'unknown_cookie_name';
        var cookieValue = Appcelerator.Util.Cookie.GetCookie(cookieName);
        
        if (!cookieValue)
        {
	        new Ajax.Request(Appcelerator.Util.ServiceBroker.serverPath+'?initial=1',
	        {
	            asynchronous: true,
	            method: 'get',
	            evalJSON:false,
	            evalJS:false,
	            onSuccess:function(r)
	            {
			        Appcelerator.Util.ServiceBroker.triggerConfig();
			        Appcelerator.Util.ServiceBroker.startTimer();
			        Logger.info('ServiceBroker ready');
	            }
	        });
            return;
        }
		
		
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

Appcelerator.Util.Performance = Class.create();
Appcelerator.Util.Performance = 
{
	logStats: (window.location.href.indexOf('logStats=1') > 0),
	stats: $H({}),
	createStat: function ()
    {
		if (this.logStats)
			return new Date();
	},
	endStat: function (start,type,category,data)
    {
		if (this.logStats)
		{
			var id = type;
			if (category)
				id = id+'.'+category
			else
				category='';
			var end = new Date();
			var stat = this.stats.get(id);
        	var diff = (end.getTime() - start.getTime());
			if (!stat)
			{
				var stat = {'type':type,'category':category,'hits':0,'mean':0,'min':diff,'max':diff,'total':0};
				this.stats.set(id,stat);
			}
			stat.hits++;
			stat.last = diff;
			stat.total +=diff;
			stat.mean = stat.total/stat.hits;
			stat.max = (stat.last > stat.max ? stat.last : stat.max); 
			stat.min = (stat.last < stat.min ? stat.last : stat.min); 
			Logger.info('stats: ' + type + ' last:' + stat.last + 'ms mean:'+stat.mean+'ms hits:'+stat.hits + ' min:'+stat.min+'ms max:'+stat.max+'ms total:' + stat.total+'ms');
		}
	},
	reset: function (start,type,data)
    {
		this.stats = $H({});
	}
};
$MQL('l:get.performance.request',function(type,msg,datatype,from)
{
	$MQ('l:get.performance.response',{'stats':Appcelerator.Util.Performance.stats.values()});
});
$MQL('l:reset.performance.request',function(type,msg,datatype,from)
{
	Appcelerator.Util.Performance.reset();
});


