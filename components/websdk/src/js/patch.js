
// 
//
if(!Appcelerator.Browser.isSafari)
{
    String.prototype.gsub = function(pattern, replacement) {
        var result = [], source = this, match;

        if(typeof pattern == 'string') {
            pattern = new RegExp(pattern,'g');
        } else {
            var flags = (pattern.multiline? 'm':'')+(pattern.ignoreCase? 'i':'')+'g';
            pattern = new RegExp(pattern.source,flags);
        }

        replacement = arguments.callee.prepareReplacement(replacement);

        var prevIndex = 0;
        var match = pattern.exec(source);
        while(match)
        {
            result.push(source.slice(prevIndex, match.index));
            prevIndex = pattern.lastIndex;
            result.push(String.interpret(replacement(match)));
            match = pattern.exec(source);
        }
        result.push(source.slice(prevIndex, source.length));

        return result.join('');
    };
    
    String.prototype.gsub.prepareReplacement = function(replacement) {
      if (Object.isFunction(replacement)) return replacement;
      var template = new Template(replacement);
      return function(match) { return template.evaluate(match) };
    };
	
}