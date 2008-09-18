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


require 'readline'

include Appcelerator
CommandRegistry.registerCommand('migrate:project','transform an existing project into an Appcelerator project',[
  {
    :name=>'service',
    :help=>'service-specific project to create (such as java)',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  }
],nil,[
  'migrate:project java',
  'migrate:project ruby'
]) do |args,options|


  service_type = args[:service]
  project_name = File.basename(Dir.pwd)

  project = Project.create(Dir.pwd, project_name, service_type, nil)

  with_io_transaction(Dir.pwd) do |tx|

    event = {:project=>project, :tx=>tx}
    PluginManager.dispatchEvents('migrate_project', event) do


      repl_loop(project)
      success = project.create_project_on_disk(tx)
      event[:success] = success
    end

  end
end

def repl_loop(project)
  path_keys = project.default_paths().keys()
  pp = File.expand_path(project.path)

  done = false
 
  while not(done)
    print_options(project, path_keys)
    option = Readline::readline("Enter letter of path to change, 'Y' to continue or 'Q' to cancel: ")

    if (option == "Y")
       done = true 
    end

    if (option == "Q")
       die "You've chosen to cancel the migration."
    end

    option = option[0] - "a"[0]
    if option >= 0 and option < path_keys.length
        path_key = path_keys[option]
        description = project.default_paths()[path_key][1]

        path = get_path(description)

        # make relative and remove leading dir separators
        path = File.expand_path(path).sub(pp, "")
        if path[0].chr == File::SEPARATOR
            path = path[1..-1]
        end

        project.config[:paths][path_key] = path
    end

  end
end

def get_path(description)
    Readline::readline("Enter new path to #{description}: ")
end

def print_options(project, path_keys)
  max = project.default_paths().values.collect { |pair| pair[1].length}.max + 5 

  path_keys.each_index { |i|
    key = path_keys[i]
    description = project.default_paths()[key][1]
    path = project.config[:paths][key]
    letter = "a"[0] + i

    dots = "." * (max - description.length)
    puts "\t[#{letter.chr}] #{description}#{dots}#{path} (#{File.expand_path(path)})"
  }
end
