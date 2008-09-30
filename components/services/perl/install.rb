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
  class Perl < Project

    def create_project(from_path,to_path,config,tx)
      Appcelerator::Installer.copy(tx,from_path,to_path, ['install.rb','build.yml'])
      tx.chmod(0755, "#{to_path}/public/servicebroker.pl")     
      tx.chmod(0755, "#{to_path}/public/proxy.pl")     
      true
    end

    @@paths.merge!({
       :lib => ["lib", "library files"],
       :services => ["app", "parent directory for Appcelerator services"]
    })

    def create_project(tx)

      from_path = @service_dir

      excludes = []
      Installer.copy(tx, "#{from_path}/pieces/services", get_path(:services))
      Installer.copy(tx, "#{from_path}/pieces/public", get_path(:web))
      Installer.copy(tx, "#{from_path}/pieces/lib", get_path(:lib))

      tx.chmod(0755, get_web_path("servicebroker.pl"))
      tx.chmod(0755, get_web_path("proxy.pl"))

      services_path = @config[:paths][:services]
      public_path = get_path(:web)

      tx.after_tx {
          file = File.join(get_path(:lib), "Appcelerator", "Service.pm")
          rel_path = get_relative_path(File.dirname(file), @config[:paths][:services])
          search_and_replace_in_file(file ,'@@services-path@@', rel_path)

          file = File.join(get_path(:web), "servicebroker.pl")
          rel_path = get_relative_path(File.dirname(file), @config[:paths][:services])
          search_and_replace_in_file(file, '@@services-path@@', rel_path)

          rel_path = get_relative_path(File.dirname(file), @config[:paths][:lib])
          search_and_replace_in_file(file , '@@lib-path@@', rel_path)
      }

      true
    end



  end
end


