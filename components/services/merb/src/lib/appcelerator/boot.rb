#
# Appcelerator SDK
#
# Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
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

