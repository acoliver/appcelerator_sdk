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

if defined?(RAILS_ROOT)
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
        Object.const_get name
    end
    
    puts "=> Appcelerator loaded"

    if not %w(console irb runner about destroy generate performance plugin process).include? File.basename($0)
      if ENV['RAILS_ENV'] != 'production'
          puts '=> Registered services.... '
          puts Appcelerator::ServiceBroker.diagnostics
          puts
      end
    end
end

