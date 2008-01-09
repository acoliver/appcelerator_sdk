/**
 * Used for defining metadata of widgets,
 * and maybe of conditions and actions.
 * 
 * Some of these types we won't define checkers for,
 * but will use them instead for auto-completion in the IDE.
 *
 */
Appcelerator.Types = {};

Appcelerator.Types.enumeration = function()
{
    var pattern = '^('+ $A(arguments).join(')|(') +')$';
    return {name: 'enumeration', values: arguments, regex: RegExp(pattern)};
};
Appcelerator.Types.openEnumeration = function()
{
	// accepts anything, suggests some things that it knows will work
    var pattern = '^('+ $A(arguments).join(')|(') +')|(.*)$';
    return {name: 'enumeration', values: arguments, regex: RegExp(pattern)};
};
Appcelerator.Types.pattern = function(regex, name)
{
	name = name || 'pattern';
    return {name: name, regex: regex};
};

Appcelerator.Types.bool = Appcelerator.Types.enumeration('true','false');
Appcelerator.Types.bool.name = "Boolean"
Appcelerator.Types.number = Appcelerator.Types.pattern(/^-?[0-9]+(\.[0-9]+)$/, 'Number');
Appcelerator.Types.naturalNumber = Appcelerator.Types.pattern(/[0-9]+/, 'Natural Number');

Appcelerator.Types.cssDimension = Appcelerator.Types.pattern(
    /^-?[0-9]+(\.[0-9]+)(%|(em)|(en)|(px)|(pc)|(pt))?$/, 'CSS Dimension');
	
Appcelerator.Types.identifier = Appcelerator.Types.pattern(
    /^[a-zA-Z_][a-zA-Z0-9_.]*$/, 'Identifier');

/*
 * Message sends can only be literal message names,
 * while message receptions can include a matching regex.
 * The distinction between these can also be used by tools
 * to detect messages sent but not received, and vice-versa
 * (probably indicating a typo).
 */
Appcelerator.Types.messageSend = Appcelerator.Types.pattern(
    /^((l:)|(r:)|(local:)|(remote:))[a-zA-Z0-9_.]+/, 'Appcelerator Message Send');
Appcelerator.Types.messageReceive = Appcelerator.Types.pattern(
    /^((l:)|(r:)|(local:)|(remote:))((~.+)|([a-zA-Z0-9_.]+))/, 'Appcelerator Message Reception');

Appcelerator.Types.onExpr          = {name: 'On Expression'};
Appcelerator.Types.fieldset        = {name: 'Fieldset'};
Appcelerator.Types.json            = {name: 'JSON Object'};
Appcelerator.Types.javascriptExpr  = {name: 'Javascript Expression'}
Appcelerator.Types.pathOrUrl       = {name: 'Path or url to resource'};
Appcelerator.Types.cssClass        = {name: 'CSS Class name'}; 
Appcelerator.Types.color           = {name: 'Color value'};
Appcelerator.Types.time            = {name: 'Time value'};
Appcelerator.Types.elementId       = {name: 'Element Id'};
Appcelerator.Types.commaSeparated  = {name: "Comma Separated Values"};
Appcelerator.Types.languageId      = {name: "Localization String Id"};

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
 * @param {Appcelerator.Type} type
 */
Appcelerator.Types.isInstance = function(value,type)
{
	if(type.regex)
	{
		return type.regex.match(value);
	}
	
	switch(type)
	{
		case Appcelerator.Types.onExpr:
		  try
		  {
		      var thens = Appcelerator.Compiler.parseExpression(value);
			  return thens && thens.length > 0;
		  }
		  catch(e)
		  {
		  	   return false;
		  }
		case Appcelerator.Types.time:
		  return value && !isNaN(Appcelerator.Util.DateTime.timeFormat(value));
		  
		case Appcelerator.Types.fieldset:
		  // this could check for the names that are currently defined,
		  // but would have of timing issues if used during compilation,
		  // we should at least make a regex that matches only valid identifiers
		  return true;
		  
		default:
		  return true;
	}
	
};
