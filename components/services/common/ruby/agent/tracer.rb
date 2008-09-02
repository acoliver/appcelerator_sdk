#
#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 

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


