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
CommandRegistry.registerCommand('create:project','create a new project',[
  {
    :name=>'path',
    :help=>'path to directory where project should be created',
    :required=>true,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  },
  {
    :name=>'name',
    :help=>'name of the project to create (such as myproject)',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  },
  {
    :name=>'service',
    :help=>'service-specific project to create (such as java)',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],nil,[
  'create:project ~/mypath test java',
  'create:project C:\mydir myproject ruby'
]) do |args,options|

  service_name = args[:service]
  service = Installer.require_component(:service, service_name, options[:version],
              :quiet_if_installed=>true)
  
  die "Couldn't find a service named '#{service_name}'." unless service
  
  puts "Using service #{service[:name]} #{service[:version]}" unless OPTIONS[:quiet]
  
  if OPTIONS[:debug]
    puts "service_dir=#{service[:dir]}"
    puts "name=#{service[:name]}"
    puts "version=#{service[:version]}"
    puts "checksum=#{service[:checksum]}"
  end
  
  from = service[:dir]
  to = File.expand_path(File.join(args[:path].path,args[:name]))
  
  # find the installer script
  script = File.join(from,'install.rb')
   
  # load the create script for the version+language
  require script

  # from and to directories
  service_name = Project.make_service_name(service[:name])
  
  puts "Creating #{service[:name]} project #{service[:version]} from: #{from}, to: #{to}" if OPTIONS[:verbose]
  
  success = false

  service_installer = Appcelerator.const_get(service_name).new
  if service_installer.respond_to? :check_dependencies
    case service_installer.method(:check_dependencies).arity
      when 0
        service_installer.check_dependencies
      when 1
        service_installer.check_dependencies(service)
      else
        raise "Service #{service[:name]} has method 'check_dependencies' but it requires more than one argument"
    end
  end
  
  event = nil

  with_io_transaction(to) do |tx|
    event = {:project_dir=>to, :service_dir=>from,:name=>args[:name],
             :service=>service[:name], :version=>service[:version], :tx=>tx}
    PluginManager.dispatchEvent 'before_create_project',event
    begin
      config, props = Installer.create_project(to,args[:name],service[:name],service[:version],tx)

      # now execute the install script
      if service_installer.create_project(from,to,config,tx)
        puts "Appcelerator #{service_name} project created ... !" unless OPTIONS[:quiet]
        success = true
      end
    ensure
      event[:success] = success
    end
  end

  PluginManager.dispatchEvent 'after_create_project',event

  success
end
