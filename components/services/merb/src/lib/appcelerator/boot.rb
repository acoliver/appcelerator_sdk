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


require 'json'

#
# these aren't provided automagically (yet) in merb so we need to add them
# taken from rail's activesupport
#
class String
  def camelize
    self.gsub(/^[a-z]|(\_[a-z])/) { |a| a.upcase.gsub("_", "") }
  end
  def underscore
    self.gsub(/::/, '/').
      gsub(/([A-Z]+)([A-Z][a-z])/,'\1_\2').
      gsub(/([a-z\d])([A-Z])/,'\1_\2').
      tr("-", "_").
      downcase
  end
end

if defined?(Merb::Config)
    
    #
    # require dependencies
    #
    Dir[File.dirname(__FILE__)+'/*.rb'].sort.delete_if {|f| File.basename(f)=='boot.rb'}.each do |file|
        require file[0..-4]
    end
      
      
    if defined?(ActiveRecord)
      #
      # trick to allow changing ActiveRecord logging stream
      #
      def log_to(stream)
        ActiveRecord::Base.logger = Logger.new(stream)
        ActiveRecord::Base.clear_active_connections!
      end
    
      #
      # shortcut to turn on logging to stdout
      #
      def log_to_stdout
         log_to STDOUT
      end 
    end
    
    # just do this once, make merb do the implicit loading for us
    Dir[Merb.root + '/app/services/*_service.rb'].each do |file|
        require file.to_s.gsub('.rb','')
        name = File.basename(file).chomp('_service.rb').camelize + 'Service'
        instance = Object.const_get name
        instance.instance.autoload_services
    end
    
    # load the agent
    require File.dirname(__FILE__)+'/agent/client'
    
    if Merb.environment == 'development'
      puts ' ~ Registered services.... '
      puts
      puts Appcelerator::ServiceBroker.diagnostics
      puts
    end

    puts ' ~ Appcelerator loaded and ready'

end

