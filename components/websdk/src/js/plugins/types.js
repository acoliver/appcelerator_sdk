/**
 * Used for defining metadata of widgets,
 * and maybe of conditions and actions.
 * 
 * Some of these types we won't define checkers for,
 * but will use them instead for auto-completion in the IDE.
 *
 */
AppC.Types = {};

AppC.Types.enumeration = function()
{
    var pattern = '^('+ $.makeArray(arguments).join(')|(') +')$';
    return {name: 'Enumeration', values: $.makeArray(arguments), regex: RegExp(pattern)};
};
AppC.Types.openEnumeration = function()
{
	// accepts anything, suggests some things that it knows will work
    var pattern = '^('+ $.makeArray(arguments).join(')|(') +')|(.*)$';
    return {name: 'Enumeration', values: $.makeArray(arguments), regex: RegExp(pattern)};
};
AppC.Types.pattern = function(regex, name)
{
	name = name || 'pattern';
    return {name: name, regex: regex};
};

AppC.Types.bool = AppC.Types.enumeration('true','false');
AppC.Types.bool.name = "Boolean"
AppC.Types.number = AppC.Types.pattern(/^-?[0-9]+(\.[0-9]+)$/, 'Number');
AppC.Types.naturalNumber = AppC.Types.pattern(/[0-9]+/, 'Natural Number');

AppC.Types.cssDimension = AppC.Types.pattern(
    /^-?[0-9]+(\.[0-9]+)(%|(em)|(en)|(px)|(pc)|(pt))?$/, 'CSS Dimension');
	
AppC.Types.identifier = AppC.Types.pattern(
    /^[a-zA-Z_][a-zA-Z0-9_.]*$/, 'Identifier');

/*
 * Message sends can only be literal message names,
 * while message receptions can include a matching regex.
 * The distinction between these can also be used by tools
 * to detect messages sent but not received, and vice-versa
 * (probably indicating a typo).
 */
AppC.Types.messageSend = AppC.Types.pattern(
    /^((l:)|(r:)|(local:)|(remote:))[a-zA-Z0-9_.]+/, 'AppC Message Send');
AppC.Types.messageReceive = AppC.Types.pattern(
    /^((l:)|(r:)|(local:)|(remote:))((~.+)|([a-zA-Z0-9_.]+))/, 'AppC Message Reception');

AppC.Types.onExpr          = {name: 'On Expression'};
AppC.Types.fieldset        = {name: 'Fieldset'};
AppC.Types.json            = {name: 'JSON Object'};
AppC.Types.javascriptExpr  = {name: 'Javascript Expression'}
AppC.Types.pathOrUrl       = {name: 'Path or url to resource'};
AppC.Types.cssClass        = {name: 'CSS Class name'}; 
AppC.Types.color           = {name: 'Color value'};
AppC.Types.time            = {name: 'Time value'};
AppC.Types.elementId       = {name: 'Element Id'};
AppC.Types.commaSeparated  = {name: "Comma Separated Values"};
AppC.Types.languageId      = {name: "Localization String Id"};
AppC.Types.string          = {name: "Javascript String"};
AppC.Types.object          = {name: "Javascript Object"};

/**
 * these are specific types used by UI controls to indicate special properties
 */
AppC.Types.condition       = {name:'Component Condition'};
AppC.Types.action          = {name:'Component Action'};

/**
 * Checks if a value conforms to some type specification.
 * Can be used for error checking of on expressions,
 * and of the parameters passed to widgets.
 * 
 * This code is primarily for use by the IDE,
 * and tools that want to provide more feedback to the user than:
 * "Compilation Failed!"
 * 
 * @param {Object} value
 * @param {AppC.Type} type
 */
AppC.Types.isInstance = function(value,type)
{
	if(type.regex)
	{
		return type.regex.test(value);
	}
	
	switch(type)
	{
		case AppC.Types.onExpr:
		  try
		  {
		      var thens = App.parseExpression(value);
			  return thens && thens.length > 0;
		  }
		  catch(e)
		  {
		  	   return false;
		  }
		case AppC.Types.time:
		  return value && !isNaN(App.timeFormat(value));
		  
		case AppC.Types.fieldset:
		  // this could check for the names that are currently defined,
		  // but would have of timing issues if used during compilation,
		  // we should at least make a regex that matches only valid identifiers
		  return true;
		  
		default:
		  return true;
	}
	
};

/*
 * Not the name, but what the symbolic identifier used to reference the type from this namespace.
 */
AppC.Types.getTypeId = function(type) 
{
	throw new Error("this method is no longer supported");
};
