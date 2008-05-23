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

class AssetCompiler
  def AssetCompiler.absolute?(value)
    !(value=~/^http(s)?:\/\//).nil?
  end
  def AssetCompiler.compile(file,hostpattern,count)
    doc = Hpricot(File.read(file))
    idx = 0
    hostpattern = "http://#{hostpattern}" unless absolute?(hostpattern)
    doc.search('script|img|link').each do |elem|
      host = hostpattern.gsub '%d', idx.to_s
      case elem.name
        when 'script','img'
          next unless elem['src']
          next if absolute? elem['src']
          next if elem.name == 'script' and elem['src']=~/appcelerator(-lite|-debug)?\.js/
          new_src = URI.join host,elem['src']
          elem.raw_attributes = elem.attributes.merge('src' => new_src)
        when 'link'
          next unless elem['href']
          next if absolute? elem['href']
          new_src = URI.join host,elem['href']
          elem.raw_attributes = elem.attributes.merge('href' => new_src)
      end
      idx+=1
      idx=0 if idx==count
    end
    doc.to_html
  end
end

include Appcelerator
CommandRegistry.registerCommand('compile:assets','compile files to setup asset hosting',[
  {
    :name=>'hostname',
    :help=>'hostname or hostname pattern such as assets%d.foo.com',
    :required=>true,
    :default=>nil,
    :type=>Types::StringType
  },
  {
    :name=>'count',
    :help=>'number of asset hosts to use',
    :required=>false,
    :default=>1,
    :type=>Types::NumberType
  }
],nil,[
  'compile:assets assets.foo.com',
  'compile:assets asset%d.foo.com 5'
]) do |args,options|

  pattern = args[:hostname]
  count = args[:count]
  
  # this is used to make sure we're in a project directory
  lang = Project.get_service
  
  if Gem.cache.search('hpricot').empty?
    $stderr.puts "This plugin requires the Ruby hpricot gem. Please run `gem install hpricot` and re-run this command."
    exit 1
  end
  
  require 'hpricot'

  with_io_transaction(Dir.pwd) do |tx|
    event = {:service=>lang, :project_dir=> Dir.pwd, :hostname=>pattern, :count=>count}
    PluginManager.dispatchEvent 'before_compile_assets',event
    count=0
    Dir["#{Dir.pwd}/public/**/*"].each do |file|
      next unless File.extname(file) =~ /\.html$/
      html = AssetCompiler.compile file,pattern,count
      tx.put file, html
      count+=1
      puts "+ Processed #{file}" if OPTIONS[:verbose]
    end
    event[:count]=count
    PluginManager.dispatchEvent 'after_compile_assets',event
    puts "Processed #{count} files" unless OPTIONS[:quiet]
  end

end
