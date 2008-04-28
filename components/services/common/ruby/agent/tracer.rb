#
# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
require 'benchmark'

class Module 

  def __make_traced_method_name(method_name)
    "#{__make_safe_method_name(method_name)}_as_traced" 
  end
  
  def __make_safe_method_name(name)
    name.to_s.tr('^a-z,A-Z,0-9', '_')
  end

  def trace_method_for_performance (method_name,recorder_method)
    klass = (self === Module) ? 'self' : 'self.class'
  
    unless method_defined?(method_name) || private_method_defined?(method_name)
      raise "cannot trace #{self}##{method_name} because it's not defined or it's a private method"
    end
  
    new_method_name = __make_traced_method_name(method_name)
    if method_defined? new_method_name
      raise "Attempt to trace a method named #{method_name} more than once"
    end
    
    untraced_method_name = "#{method_name}_as_untraced"
    
    code = <<-CODE
      def #{new_method_name}(*args, &block)
        result = nil
        ex = nil
        tms = Benchmark.measure do 
          begin
            result = #{untraced_method_name}(*args, &block)
          rescue => e
            ex = e
          end
        end
        #{recorder_method}(self.class,'#{method_name}',args,tms,result,ex)
        raise ex if ex
        result
      end
    CODE

    class_eval code, __FILE__, __LINE__
    
    alias_method untraced_method_name, method_name
    alias_method method_name, new_method_name
  end

end


