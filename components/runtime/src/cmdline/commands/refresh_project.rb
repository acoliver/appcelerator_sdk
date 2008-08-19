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
CommandRegistry.registerCommand('refresh:project',
'update project config to include widgets and plugins that have been added manually', [
  {
    :name=>'path',
    :help=>'path of the project',
    :required=>false,
    :default=>nil,
    :type=>[
      Types::FileType,
      Types::DirectoryType,
      Types::AlphanumericType
    ],
    :conversion=>Types::DirectoryType
  }
],nil,nil, :project) do |args,options|

  project_dir = File.expand_path(args[:path] || Dir.pwd)

  FileUtils.cd(project_dir) do 
    lang = Project.get_service(project_dir)
    
    Installer.with_project_config(project_dir) do |config|      
      refresh_components(Dir['public/widgets/*/build.yml'], config[:widgets])          
      refresh_components(Dir['plugins/*/build.yml'], config[:plugins]) # are plugins installed like this?
    end
  end
end

def refresh_components(build_yamls, component_configs)
  build_yamls.each do |build_yaml|
    component_info = YAML::load_file build_yaml
    if not component_in_config(component_configs, component_info[:name])
      puts "Adding #{component_info[:name]} #{component_info[:version]} to config" unless OPTIONS[:quiet]
      component_configs << component_info.clone_keys(:name,:version)
    end
  end
end

def component_in_config(components, name)
  components.each do |cm|
    if cm[:name] == name
      return true
    end
  end
  return false
end
# TODO: this should be moved into the core/lib directory and used most places where we munge the project config

