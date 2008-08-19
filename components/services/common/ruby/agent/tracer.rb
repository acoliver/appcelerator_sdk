#
#
# This file is part of Appcelerator.
#
# Copyright (c) 2006-2008, Appcelerator, Inc.
# All rights reserved.
# 
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
# 
#     * Redistributions in binary form must reproduce the above copyright notice,
#       this list of conditions and the following disclaimer in the documentation
#       and/or other materials provided with the distribution.
# 
#     * Neither the name of Appcelerator, Inc. nor the names of its
#       contributors may be used to endorse or promote products derived from this
#       software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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


