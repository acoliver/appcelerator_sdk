# This file is part of Appcelerator.
#
# Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
# For more information, please visit http://www.appcelerator.org
#
# Appcelerator is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

module Appcelerator
  class Project
    def Project.get_language(pwd=Dir.pwd)
      config_file = File.join(pwd,'config','appcelerator.config')

      if not File.exists?(config_file)
        STDERR.puts "This directory doesn't look like an Appcelerator project. Please switch to your project directory and re-run"
        exit 1
      end

      config = YAML.load_file config_file
      config[:language]
    end
    
    def Project.list_installed_sdks
      puts
      puts "The following web SDK version(s) are locally installed:"
      puts

      dir = "#{RELEASE_DIR}/web"
      vers = []

      config = YAML.load_file "#{dir}/config.yml" if File.exists?("#{dir}/config.yml")

      Dir["#{dir}/*"].each do |v|
        next unless File.directory?(v)
        vs = File.basename(v) if v=~/[0-9]+\.[0-9]+(\.[0-9]+)?/ and File.directory?(v)
        vs << '*' if config and "#{config[:version]}"==File.basename(v)
        vers << vs
      end

      str = ' ' * 10 + '> ' 
      str << "#{vers.join(', ')}"
      puts str

      puts
    end
    
    def Project.list_installed_components(type)

      puts
      puts "The following #{type} versions are locally installed:"
      puts

      dir = "#{RELEASE_DIR}/#{type}"

      Dir["#{dir}/*"].each do |d|
        next unless File.directory?(d)
        
        name = File.basename(d).gsub('_',':')
        str = ' ' * 10 + '> ' + name + ' '*(20-name.length)
        
        config = YAML.load_file "#{d}/config.yml" if File.exists?("#{d}/config.yml")
        
        vers = []
        Dir["#{d}/*"].each do |v|
          next unless File.directory?(v)
          vs = File.basename(v) if v=~/[0-9]+\.[0-9]+(\.[0-9]+)?/ and File.directory?(v)
          vs << '*' if config and "#{config[:version]}"==File.basename(v)
          vers << vs
        end
        
        str << "[#{vers.join(', ')}]"
        
        puts str
      end

      puts
    end
  end
end