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



module Appcelerator
  class Zend < Project
    @@paths.merge!({
       :lib => ["lib", "library files"],
       :controllers => ["application/controllers", "Zend Framework controllers includes"],
       :views => ["application/views/scripts", "Zend Framework views"],
       :services => ["application/services", "Appcelerator services"]
    })

    def create_project(tx)
      puts "Creating new Zend Framework project using #{@service_dir}" if OPTIONS[:debug]

      excludes = []
      Installer.copy(tx, "#{@service_dir}/pieces/root", @path, excludes)
      Installer.copy(tx, "#{@service_dir}/pieces/controllers", get_path(:controllers))
      Installer.copy(tx, "#{@service_dir}/pieces/lib", get_path(:lib))
      Installer.copy(tx, "#{@service_dir}/pieces/public", get_path(:web))
      Installer.copy(tx, "#{@service_dir}/pieces/services", get_path(:services))
      Installer.copy(tx, "#{@service_dir}/pieces/views", get_path(:views))

      tx.after_tx {
          file = File.join(get_path(:lib), "Appcelerator", "Service.php")
          rel_path = get_relative_path(File.dirname(file), @config[:paths][:services])
          search_and_replace_in_file(file ,'@@services-path@@', rel_path)

          file = File.join(get_path(:web), "index.php")
          rel_path = get_relative_path(File.dirname(file), @config[:paths][:controllers])
          search_and_replace_in_file(file, '@@controller-path@@', rel_path)

          rel_path = get_relative_path(File.dirname(file), @config[:paths][:lib])
          search_and_replace_in_file(file , '@@lib-path@@', rel_path)

          search_and_replace_in_file(
                File.join(@path, ".project"), "MYAPP", @config[:name])
      }

      true
    end

    def get_relative_path(from_dir, to_path)
        pp = File.expand_path(@path)
        final = ""

        while (pp != from_dir)
            from_dir = File.expand_path(File.join(from_dir, ".."))
            final = final + "../"
        end

        if not(final.nil?) and final.length > 0
            File.join(final, to_path)
        else
            to_path
        end

    end

    def search_and_replace_in_file(file, to_find, to_replace)
      content = File.read(file).gsub!(to_find, to_replace)

      f = File.open(file,'w+')
      f.puts(content)
      f.flush()
      f.close()
      true
    end
    
  end
end


