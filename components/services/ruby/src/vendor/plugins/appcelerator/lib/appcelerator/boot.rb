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

if defined?(RAILS_ROOT)
  # only run this if we're in the server and not one of the console programs
  if not %w(console irb runner about destroy generate performance plugin process).include? File.basename($0)
    def model_name(name)
      name.to_s.gsub(/[::]{2}/,'.').split('.').collect {|token| token.underscore }.join('.')
    end
    
    #
    # require dependencies
    #
    Dir[File.dirname(__FILE__)+'/*.rb'].sort.delete_if {|f| File.basename(f)=='boot.rb'}.each do |file|
        require file[0..-4]
    end
      
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
    
    # just do this once, make rails do the implicit loading for us
    Dir[RAILS_ROOT + '/app/services/*_service.rb'].each do |file|
        name = Inflector.camelize(File.basename(file).chomp('_service.rb')) + 'Service'
        instance = Object.const_get name
        instance.instance.autoload_services
    end
    
    # load the agent
    require File.dirname(__FILE__)+'/agent/client'
  end
end

