
begin
    require 'rubygems'
    json = Gem.cache.search('json')
    if json and json.first
      require 'json'
      SBC_HAS_JSON = true
    else
      SBC_HAS_JSON = false
    end
rescue
    SBC_HAS_JSON = false
end  


#
# JSON Pure Library by Florian Frank <flori@ping.de>
#
# Download source/binary from http://json.rubyforge.org/
#
# Ruby License, see the RUBY file included in the source distribution. The Ruby
# License includes the GNU General Public License (GPL), Version 2, so see the
# file GPL as well.

if not SBC_HAS_JSON
  dir = "#{File.dirname(__FILE__)}"
  require "#{dir}/_json_pure_generator"
  require "#{dir}/_json_pure_parser"
  
  def deep_const_get(path) # :nodoc:
    path = path.to_s
    path.split(/::/).inject(Object) do |p, c|
      case
      when c.empty?             then p
      when p.const_defined?(c)  then p.const_get(c)
      else                      raise ArgumentError, "can't find const #{path}"
      end
    end
  end
  generator_methods = JSON::Pure::Generator::GeneratorMethods
  for const in generator_methods.constants
    klass = deep_const_get(const)
    modul = generator_methods.const_get(const)
    klass.class_eval do
      instance_methods(false).each do |m|
        m.to_s == 'to_json' and remove_method m
      end
      include modul
    end
  end
end