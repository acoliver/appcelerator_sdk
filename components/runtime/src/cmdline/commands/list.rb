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

