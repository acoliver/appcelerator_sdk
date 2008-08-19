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

