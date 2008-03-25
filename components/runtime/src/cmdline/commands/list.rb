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
  ]) do |args,options|
    
    # TODO: format this output
    
    list = Installer.fetch_distribution_list options[:ping]
    if args[:type]
      l = list[args[:type]] || list[args[:type].to_sym]
      if l
        if args[:name]
          l.each do |e|
            if e[:name] == args[:name]
              puts e.to_yaml unless OPTIONS[:quiet]
              break
            end
          end
        else
          puts l.to_yaml unless OPTIONS[:quiet]
        end
      else
        die "Couldn't find component type: '#{args[:type]}'" unless OPTIONS[:quiet]
        exit 1 # WTF!?
      end
    else
      puts list.to_yaml unless OPTIONS[:quiet]
    end
  end
end
