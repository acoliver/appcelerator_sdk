

Appcelerator.Util.IdleManager = Class.create();

/**
 * idle manager is a simple manager that will track
 * movements on the mouse and keystrokes to determine (infer)
 * when the user is "IDLE" or "ACTIVE"
 *
 */
Appcelerator.Util.IdleManager =
{
    IDLE_TIME: 60000, // 1 min of no activity is considered default idle
    timestamp: null,
    activeListeners:[],
    idleListeners:[],
    idle: false,
    started: false,

    install: function ()
    {
    	if (this.started) return;
    	
    	this.started = true;
        this.event = this.onActivity.bind(this);
        this.timestamp = new Date().getTime();

        // track keyboard and mouse move events to determine
        // when the user is idle
        Event.observe(window, 'keypress', this.event, false);
        Event.observe(window, 'mousemove', this.event, false);

        var self = this;
        Event.observe(window, 'unload', function()
        {
            Event.stopObserving(window, 'keypress', self.event, false);
            Event.stopObserving(window, 'mousemove', self.event, false);
            self.event = null;
        }, false);

        // start idle timer monitor
        this.startTimer();
    },

    startTimer: function ()
    {
        this.stopTimer();

        // precision on idle is 1/2 second which should be perfectly acceptable
        this.timer = setInterval(this.onTimer.bind(this), 500);
    },

    stopTimer: function ()
    {
        if (this.timer)
        {
            clearInterval(this.timer);
            this.timer = 0;
        }
    },

    onTimer: function ()
    {
        if (this.isIdle())
        {
            // stop the timer until we're active again
            this.stopTimer();

            this.idle = true;

            // notify listeners
            if (this.idleListeners.length > 0)
            {
                this.idleListeners.each(function(l)
                {
                    l.call(l);
                });
            }
        }
    },

    registerIdleListener: function (l)
    {
    	Appcelerator.Util.IdleManager.install();
        this.idleListeners.push(l);
    },

    unregisterIdleListener: function (l)
    {
        this.idleListeners.remove(l);
    },

    registerActiveListener: function (l)
    {
    	Appcelerator.Util.IdleManager.install();
        this.activeListeners.push(l);
    },

    unregisterActiveListener: function (l)
    {
        this.activeListeners.remove(l);
    },

    isIdle: function ()
    {
        return this.getIdleTimeInMS() >= this.IDLE_TIME;
    },

    getIdleTimeInMS: function ()
    {
        return (new Date().getTime() - this.timestamp);
    },

    onActivity: function ()
    {
        this.timestamp = new Date().getTime();

        // not idle anymore...
        if (this.idle)
        {
            this.idle = false;

            // notify any listeners
            if (this.activeListeners.length > 0)
            {
                this.activeListeners.each(function(l)
                {
                    l.call(l);
                });
            }

            // restart timer
            this.startTimer();
        }

        return true;
    }
};

