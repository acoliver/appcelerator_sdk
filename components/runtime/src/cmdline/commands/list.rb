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

include Appcelerator
CommandRegistry.makeGroup(:list) do |group|

  group.registerCommand(%w(list:widgets list:widget),'list widgets installed locally') do |args,options|
    Project.list_installed_components 'widget'
  end

  group.registerCommand(%w(list:services list:service),'list SOA integrations installed locally') do |args,options|
    Project.list_installed_components 'service'
  end

  group.registerCommand(%w(list:websdks list:websdk),'list web SDKs installed locally') do |args,options|
    Project.list_installed_components 'websdk'
  end

  group.registerCommand(%w(list:plugins list:plugin),'list plugins installed locally') do |args,options|
    Project.list_installed_components 'plugin'
  end

  group.registerCommand(%w(list:all list),'list all components installed locally') do |args,options|
    Project.list_installed_components 'websdk' 
    Project.list_installed_components 'service'
    Project.list_installed_components 'plugin'
    Project.list_installed_components 'widget'
  end

  group.registerCommand('list:network','list all components available on the network',
  [
    {
      :name=>'type',
      :help=>'type of component to list (widget,plugin,etc...)',
      :required=>false,
      :default=>nil,
      :type=>Types::AnyType
    },
    {
      :name=>'name',
      :help=>'name of component to list',
      :required=>false,
      :default=>nil,
      :type=>Types::AnyType
    }
  ],
  [
    {
       :name=>:ping,
       :display=>'--ping',
       :value=>false
    },
    {
       :name=>:format,
       :display=>'--format=yaml',
       :help=>'format for printing results, human-readable by default, can also be yaml',
       :default=>'',
       :value=>true,
    },
  ]) do |args,options|
    
    ping = options[:ping]
    type = args[:type]
    name = args[:name]
    
    list = Installer.fetch_distribution_list(ping)
    
    if options[:format] == 'yaml'
      showYaml(list, args)
    
    else # human format
      type = args[:type].gsub(/s$/,'').to_sym
      name = args[:name]
      if type
        if name
          components = Installer.get_remote_components(args)
          listComponents(type, components)
        else
          listComponents(type, list[type])
        end
      else
        list.each do |ty,components|
          listComponents(ty, components)
        end
      end
    end
  end
end

def listComponents(type, components)
  puts
  puts "The following #{type} versions are available remotely:"
  puts

  components.each do |cm|
    puts "          >  #{cm[:name].ljust(32)} [#{cm[:version]}]"
  end

  puts ' ' * 10 + 'No #{type}s available' if components.empty?
  puts
end

def showYaml(list, args)
  if args[:type]
    l = list[args[:type].to_sym]
    if l
      if args[:name]
        l.each do |e|
          if e[:name] == args[:name]
            puts e.to_yaml
          end
        end
      else
        puts l.to_yaml
      end
    else
      die "Couldn't find component type: '#{args[:type]}'" unless OPTIONS[:quiet]
    end
  else
    puts list.to_yaml unless OPTIONS[:quiet]
  end
end

