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
CommandRegistry.registerCommand(%w(add:theme add:themes),'add theme to a project',[
  {
    :name=>'name',
    :help=>'name of the theme to add (such as app:my_theme)',
    :required=>true,
    :default=>nil,
    :type=>Types::AnyType
  },
  {
    :name=>'path',
    :help=>'path of the project to add the theme to',
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
    :help=>'specify a version of the theme to use',
    :value=>true
  }
],[
  'add:theme panel:thinline',
  'add:themes panel:thinline,input:greybox',
  'add:theme panel:foobar ~/myproject'
]) do |args,options|
  
  pwd = File.expand_path(args[:path] || Dir.pwd)
  config = options[:project_config] || Installer.get_project_config(pwd)
  # this is used to make sure we're in a project directory
  # but only if we didn't pass in path
  Project.get_service(pwd) unless options[:ignore_path_check]
    
  FileUtils.cd(pwd) do 

    with_io_transaction(pwd,options[:tx]) do |tx|
      
      theme_names = args[:name].split(',').uniq
      theme_names.each do |name|
            
        theme = Installer.require_component(:theme, name, options[:version], options)
        
        control = theme[:control]
        control_type = theme[:name][0,theme[:name].index(':')]
        theme_name = theme[:name][theme[:name].index(':')+1..-1]
        
        to_dir = "#{Dir.pwd}/public/components/#{control_type}/#{control}/themes/#{theme_name}"
        tx.mkdir to_dir

        event = {:name=>name,:control=>control,:theme_name=>theme_name,:version=>theme[:version],:theme_dir=>theme[:dir],:to_dir=>to_dir}
        PluginManager.dispatchEvents('add_theme', event) do
          Installer.copy tx, theme[:dir], to_dir

          themes = config[:themes] ||= []
          themes.delete_if { |w| w[:name] == name } 
          themes << {:name=>theme[:name],:version=>theme[:version]}
        end
        puts "Added #{theme[:name]} #{theme[:version]}" unless OPTIONS[:quiet] or options[:quiet]
      end
      Installer.save_project_config(pwd,config) unless options[:no_save]
    end
    
  end
end
