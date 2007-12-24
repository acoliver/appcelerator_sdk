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

require 'action_controller'
require 'active_record'

class ServiceGenerator < Rails::Generator::NamedBase

  def initialize(runtime_args, runtime_options = {})
     super
     usage if args.empty?

     @messagename = args.shift rescue usage
     @messagetype = args.shift rescue usage
     @messagefunc = args.shift rescue usage
     @responsemsg = args.shift rescue nil
     
     usage if @messagename==nil
     usage if @messagetype==nil
     usage if @messagefunc==nil
     
     # trim off : if they use it
     if @messagefunc[0] == 58
       @messagefunc = @messagefunc.slice(1..@messagefunc.length)
     end

     camel  = @messagename.camelize
     under  = camel.underscore

     @messageFile  = under.downcase + '_service.rb'
     @messageClass = camel + 'Service'
  end
  
  def usage_message
    File.read(File.join(File.dirname(__FILE__), 'USAGE')) rescue ''
  end

  def manifest
    record do |m|
      # Check for class naming collisions.
      m.class_collisions @messageClass

      # make sure we have a services dir
      m.directory File.join('app/services', class_path)
      
      responsetype = ''
      response = ''
      
      if @responsemsg
        responsetype = ", '#{@responsemsg}'"
        response = '{"success"=>true}'
      end

      # message handler template
      m.template 'service/templates/service.rb',
                  File.join('app/services',
                            class_path,
                            "#{@messageFile}"),
                            :assigns => {'messageclass'=>@messageClass, 'messagetype'=>@messagetype, 'messagefunc'=>@messagefunc, 'responsetype'=>responsetype, 'response'=>response}
    end
  end
end
