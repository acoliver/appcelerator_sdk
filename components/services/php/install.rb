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
  class Php < Project
    def create_project(tx)

      from_path = @service_dir

      excludes = []
      Installer.copy(tx, "#{from_path}/pieces/root", @path, excludes)
      Installer.copy(tx, "#{from_path}/pieces/services", get_path(:services))
      Installer.copy(tx, "#{from_path}/pieces/public", get_path(:web))

      services_path = @config[:paths][:services]
      public_path = get_path(:web)
      path_to_services_dir = get_relative_path(public_path, services_path)

      tx.after_tx {
          files = [get_web_path("servicebroker.php")]
          files.each { |file|
              search_and_replace_in_file(file ,"@@path@@", path_to_services_dir)
          }
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


