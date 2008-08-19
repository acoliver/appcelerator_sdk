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
CommandRegistry.registerCommand(%w(add:plugin add:plugins),'add plugin to a project',[
  {
    :name=>'name',
    :help=>'name of the plugin to add (such as foo:plugin)',
    :required=>true,
    :default=>nil,
    :type=>Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the plugin to',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],[
  {
    :name=>'version',
    :display=>'--version=X.X.X',
    :help=>'version of the plugin to add',
    :value=>true
  }
],[
  'add:plugin my:plugin',
  'add:plugins my:plugin,your:plugin',
  'add:plugin my:plugin ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  plugin_names = args[:name].split(',').uniq
  config = options[:project_config] || Installer.get_project_config(pwd)
  plugins = config[:plugins] ||= []
  
  FileUtils.cd(pwd) do 
    # make sure we're in a project directory, unless passing option to skip this test
    Project.get_service(pwd) unless options[:ignore_path_check]
    
    with_io_transaction(pwd,options[:tx]) do |tx|
      
      plugin_names.each do |name|
        class_name = name.gsub(/\/(.?)/) { "::" + $1.upcase }.gsub(/(^|_|:)(.)/) { $2.upcase }
        plugin_name = name.gsub ':', '_'

        plugin = Installer.require_component(:plugin,name,options[:version],
          :force=>options[:force], :quiet_if_installed=>true, :tx=>tx)
        
        die "Couldn't find plugin named: #{name}." unless plugin
        
        to_dir = File.expand_path "#{pwd}/plugins/#{plugin_name}"
        tx.mkdir to_dir
        
        event = {:name=>name,:version=>plugin[:version],:plugin_dir=>plugin[:dir],:to_dir=>to_dir,:project_dir=>pwd,:tx=>tx}
        PluginManager.dispatchEvents('add_plugin',event) do
          plugins.delete_if { |w| w[:name] == name } 
          plugins << {:name=>name,:version=>plugin[:version]}        
        end
        puts "Added Plugin: #{name}, #{plugin[:version]} to project: #{to_dir}" unless OPTIONS[:quiet]
      end
      
      Installer.save_project_config(pwd,config) unless options[:no_save]
    end
  end
end
