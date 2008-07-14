
%w(button input iterator panel rounded select tabpanel textarea).each do |name|
  Dir["#{name}/themes/*"].each do |dirname|
    theme = File.basename(dirname)
    code=<<-END
Appcelerator.Core.registerTheme('#{name}','#{theme}',{
  build: function(element,options)
  {
  }
});
    END
    f = File.new "#{dirname}/#{theme}.js", 'w+'
    f.puts code
    f.close
  end
end