
Appcelerator.Util.EventBroadcaster = Class.create();

Object.extend(Appcelerator.Util.EventBroadcaster.prototype,
{
    listeners: [],

    addListener: function(listener)
    {
        this.listeners.push(listener);
    },

    removeListener: function(listener)
    {
        if (!this.listeners)
        {
            return false;
        }
        return this.listeners.remove(listener);
    },

    dispose: function ()
    {
        if (this.listeners)
        {
            this.listeners.clear();
        }
    },

    fireEvent: function()
    {
        if (!this.listeners || this.listeners.length == 0)
        {
            $D(this + ' not firing event: registered no listeners');
            return;
        }

        var args = $A(arguments);

        if (undefined == args || 0 == args.length)
        {
            throw "fire event not correct for " + this + ", requires at least a event name parameter";
        }

        // name is always the first parameter
        var name = args.shift();

        // format is always onXXXX
        var ch = name.charAt(0).toUpperCase();
        var method = "on" + ch + name.substring(1);

        $D(this + ' firing event: ' + method + ', listeners: ' + this.listeners.length);

        this.listeners.each(function(listener)
        {
            var f = listener[method];
            if (f)
            {
                f.apply(listener, args);
            }
            else if (typeof(listener) == 'function')
            {
                listener.apply(listener, args);
            }
        });
    }
});

Appcelerator.Util.KeyManager = Class.create();

Object.extend(Appcelerator.Util.KeyManager,
{
    monitors: [],
    KEY_ENTER: 1,
    KEY_ESCAPE: 2,
    KEY_SPACEBAR: 3,
    disabled: false,
    installed:false,

    toString: function ()
    {
        return '[Appcelerator.Util.KeyManager]';
    },

    disable: function ()
    {
        this.disabled = true;
    },

    enable: function ()
    {
        this.disabled = false;
    },

    install: function ()
    {
        this.installed = true;
        this.keyPressFunc = this.onkeypress.bindAsEventListener(this);
        // NOTE: you *must* not use Event.observe here for this or you
        // won't be able to stop propogration (and you'll get a page reload on
        // hitting the enter key) of the event
        document.body.onkeypress = this.keyPressFunc;
        Appcelerator.Core.onunload(this.dispose.bind(this));
    },

//FIXME FIXME - install the blur/focus handler on body and then just iterate over monitors

    dispose: function ()
    {
        document.body.onkeypress = null;
        this.keyPressFunc = null;
        var self = this;
        this.monitors.each(function(m)
        {
            self.removeHandler(m[0], m[1]);
        });
        this.monitors = null;
    },

    removeHandler: function (key, element)
    {
        if (element)
        {
            var focusHandler = element['_focusHandler_' + key];
            var blurHandler = element['_blurHandler_' + key];

            if (focusHandler)
            {
                Event.stopObserving(element, 'focus', focusHandler, false);
                try
                {
                    delete element['_focusHandler_' + key];
                }
                catch (E)
                {
                }
            }
            if (blurHandler)
            {
                Event.stopObserving(element, 'blur', blurHandler, false);
                try
                {
                    delete element['_blurHandler_' + key];
                }
                catch (E)
                {
                }
            }
        }
        if (this.monitors.length > 0)
        {
            var found = null;
            for (var c = 0,len = this.monitors.length; c < len; c++)
            {
                var a = this.monitors[c];
                if (a[0] == key && a[1] == element)
                {
                    found = a;
                    break;
                }
            }
            if (found)
            {
                this.monitors.remove(found);
            }
        }
    },

    installHandler: function (key, element, handler)
    {
        if (!this.installed) this.install.bind(this);
        
        var self = this;

        this.removeHandler(key, element);

        var array = [key,element,handler];

        if (element)
        {
            var focusHandler = function(e)
            {
                e = Event.getEvent(e);
                element.focused = true;
                self.monitors.remove(array);
                self.monitors.push(array);
                return true;
            };

            var blurHandler = function(e)
            {
                e = Event.getEvent(e);
                element.focused = false;
                self.monitors.remove(array);
                return true;
            };

            element['_focusHandler_' + key] = focusHandler;
            element['_blurHandler_' + key] = blurHandler;

            Event.observe(element, 'focus', focusHandler, false);
            Event.observe(element, 'blur', blurHandler, false);
        }
        else
        {
            this.monitors.push(array);
        }
    },

    onkeypress: function (e)
    {
        if (this.monitors.length > 0 && !this.disabled)
        {
        	e = Event.getEvent(e);
            var stop = false;
            for (var c = 0,len = this.monitors.length; c < len; c++)
            {
                var m = this.monitors[c];
                if ((Event.isEnterKey(e) && m[0] == Appcelerator.Util.KeyManager.KEY_ENTER) ||
                    (Event.isEscapeKey(e) && m[0] == Appcelerator.Util.KeyManager.KEY_ESCAPE) ||
                    (Event.isSpaceBarKey(e) && m[0] == Appcelerator.Util.KeyManager.KEY_SPACEBAR))
                {
                    var target = Event.element(e);
                    if (m[1] == null || target == m[1])
                    {
                        // NOTE: this only allows one handler to be registered for
                        // a field+event combo, we might want to allow multiples here
                        // and just stop below
                        m[2](e);
                        stop = true;
                        break;
                    }
                }
            }
            if (stop)
            {
                Event.stop(e);
                return false;
            }
        }
        return true;
    }
});

Appcelerator.Core.onload(Appcelerator.Util.KeyManager.install.bind(Appcelerator.Util.KeyManager));
