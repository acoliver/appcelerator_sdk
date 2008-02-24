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


Appcelerator::CommandRegistry.registerCommand('install:plugin','install a plugin',[
  {
    :name=>'location',
    :help=>'path or URL to plugin file or name of a plugin from the network',
    :required=>true,
    :default=>nil,
    :type=>Appcelerator::Types::StringType
  }
],nil,[
    'install:plugin my:plugin',
    'install:plugin my:plugin,your:plugin',
    'install:plugin http://www.mydir.com/aplugin.zip',
    'install:plugin foo_plugin.zip',
    'install:plugin foo:bar --server=http://localhost:3000'
]) do |args,options|

    args[:location].split(',').uniq.each do |plugin|
      to_dir,name,version,checksum,already_installed = Appcelerator::Installer.install_component :plugin,'Plugin',plugin.strip
      comp = {:name=>name,:type=>:plugin,:version=>version}
      component = Appcelerator::Installer.get_installed_component comp
      Appcelerator::Installer.with_site_config(true) do |config|
        plugin_name = name.gsub(':','_')
        config[:onload]||=Array.new
        plugin_path = "#{to_dir}/#{plugin_name}.rb"
        config[:onload].delete_if { |e| e[:name]==plugin_name }
        config[:onload] << {:name=>plugin_name, :path=>plugin_path}
      end
    end
end

