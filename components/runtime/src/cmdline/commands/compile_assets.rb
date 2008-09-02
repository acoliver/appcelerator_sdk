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
