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
       :name=>:format,
       :display=>'--format=yaml',
       :help=>'format for printing results, human-readable by default, can also be yaml',
       :default=>'',
       :value=>true,
    },
  ]) do |args,options|
    
    type = args[:type]
    name = args[:name]
    
    list = Installer.fetch_distribution_list()
    
    if options[:format] == 'yaml'
      showYaml(list, args)
    
    else # human format
      type = args[:type].gsub(/s$/,'').to_sym if args[:type]
      name = args[:name]
      if type
        if name
          components = Installer.get_remote_components(args)
        else
          components = list[type] || []
        end
        if components.empty?
          raise UserError.new("Couldn't find component type: '#{args[:type]}'")
        else
          listComponents(type, components)
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
  
  components ||= []  
  components.each do |cm|
    puts "          >  #{cm[:name].ljust(32)} [#{cm[:version]}]"
  end

  puts ' ' * 10 + "No #{type}s available" if components.empty?
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

