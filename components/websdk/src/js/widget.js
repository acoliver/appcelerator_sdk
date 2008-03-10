/***************************************************************************/
/*                                                                         */
/*  These are the public widget APIs that should be accessible by a user-  */
/*  defined widget.                                                        */
/*                                                                         */
/*                                                                         */
/***************************************************************************/


/**
 * called by a widget to register itself
 *
 * @param {string} modulename
 * @param {object} module object
 * @param {boolean} dynamic
 * @since 2.1.0
 */
Appcelerator.Widget.register = function(moduleName,module,dynamic)
{
	Appcelerator.Core.registerModule(moduleName,module,dynamic);
};

/**
 * called to load a js file relative to the module js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js files(s)
 * @param {string} js path
 */
Appcelerator.Widget.registerWithJS = function (moduleName,module,js,jspath)
{
	Appcelerator.Core.registerModuleWithJS(moduleName,module,js,jspath);
};

/**
 * called to load a js file relative to the modules/common/js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js file(s)
 * @deprecated use registerWidgetWithCommonJS
 */
Appcelerator.Widget.registerModuleWithCommonJS = function(moduleName,module,js)
{
	Appcelerator.Core.registerModuleWithCommonJS(moduleName,module,js);
};

/**
 * called to load a js file relative to the modules/common/js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js file(s)
 * @since 2.1.0
 */
Appcelerator.Widget.registerWidgetWithCommonJS = function(moduleName,module,js)
{
	Appcelerator.Core.registerModuleWithCommonJS(moduleName,module,js);
};

/**
 * called to load a js file relative to the module js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js files(s)
 * @param {string} js path
 * @deprecated use registerWidgetWithJS
 */
Appcelerator.Widget.registerModuleWithJS = function (moduleName,module,js,jspath)
{
	Appcelerator.Core.registerModuleWithJS(moduleName,module,js,jspath);
};

/**
 * called to load a js file relative to the module js directory
 *
 * @param {string} moduleName
 * @param {object} module object
 * @param {string} js files(s)
 * @param {string} js path
 * @since 2.1.0
 */
Appcelerator.Widget.registerWidgetWithJS = function (moduleName,module,js,jspath)
{
	Appcelerator.Core.registerModuleWithJS(moduleName,module,js,jspath);
};

/**
 * load widget's css from widget/common
 * @param {string} moduleName
 * @param {string} css path
 */
Appcelerator.Widget.loadWidgetCommonCSS = function(moduleName,css)
{
	Appcelerator.Core.loadModuleCommonCSS = function(moduleName,css)
};

/**
 * dynamically load CSS from common CSS path and call onload once 
 * loaded (or immediately if already loaded)
 *
 * @param {string} name of the common file
 * @param {function} onload function to invoke
 * @since 2.1.0
 */
Appcelerator.Widget.requireCommonCSS = function(name,onload)
{
	Appcelerator.Core.requireCommonCSS(name,onload);
};

/**
 * dynamically load JS from common JS path and call onload once 
 * loaded (or immediately if already loaded)
 *
 * @param {string} name of the common js
 * @param {function} onload function to callback upon loaded
 * @since 2.1.0
 */
Appcelerator.Widget.requireCommonJS = function(name,onload)
{
	Appcelerator.Core.requireCommonJS(name,onload);
};

/**
 * dynamically laod a javascript file with dependencies
 * this will not call the callback until all resources are loaded
 * multiple calls to this method are queued
 * 
 * @param {string} path to resource
 * @param {function} the string representation of the callback
 * @since 2.1.0
 */
Appcelerator.Widget.queueRemoteLoadScriptWithDependencies = function(path, onload) 
{
	Appcelerator.Core.queueRemoteLoadScriptWithDependencies(path, onload);
};


/**
 * dynamically load a widget specific CSS
 */
Appcelerator.Widget.loadWidgetCSS = function(name,css)
{
	Appcelerator.Core.loadModuleCSS(name,css);
}