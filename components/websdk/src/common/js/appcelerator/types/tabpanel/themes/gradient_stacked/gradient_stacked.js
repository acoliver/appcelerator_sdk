Appcelerator.Core.registerTheme('tabpanel','gradient_stacked',{
  build: function(element,options)
  {
	$(element.id + "_left").innerHTML = options.title || '';
  }
});
