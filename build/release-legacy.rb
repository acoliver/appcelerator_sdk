#!/usr/bin/env ruby
#
# This file is part of Appcelerator.
#
# Copyright 2006-2008 Appcelerator, Inc.
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
#

#
# Usage:
#
# ./release.rb (<file>...)
#
# one or more <file>s are optional which will only release those specific
#
# if you pass in no files, all components under the stage directory (excluding installers)
# will be released (if changed).
#

require 'fileutils'
require 'rubygems'
require 'aws/s3'
require 'zip/zip'
require 'digest/md5'
require 'stringio'
require 'zlib'
require 'json'

DISTRO_BUCKET = 'distro.appcelerator.org'
CODE_BUCKET = 'code.appcelerator.org'
LOG_BUCKET = 'logging.appcelerator.org'
TRACKER_BUCKET = 'tracker.appcelerator.org'

DISTRO_SITE="http://#{DISTRO_BUCKET}"
CODE_SITE="http://#{CODE_BUCKET}"

EXPIRES = 'Sun, 05 Apr 2037 10:22:00 GMT'

@fullrelease = true
target_files = []
@total = 0
@websdk = false

# if you pass in files on command line, we'll only release those files
if ARGV.length > 0
  c = 0
  while c < ARGV.length
    t = File.expand_path(ARGV[c])
    if not File.exists?(t)
      $stderr.puts "Invalid path to: #{ARGV[c]}. File does not exist!"
      exit 1
    end
    target_files << t
    c+=1
  end
  @fullrelease = false if c > 0
end

if @fullrelease
  stage_dir = File.expand_path(File.join('stage'))
  dir = File.expand_path(File.join(stage_dir,'webunit'))

  if not dir or not File.directory? dir
  	$stderr.puts "Not a directory: #{dir}"
  	$stderr.puts "You can run `rake websdk:test` to generate a basic layout" if File.directory?(File.expand_path("components"))
    exit 1
  end
end

def get_home
  if ENV['HOME']
    ENV['HOME']
  elsif ENV['USERPROFILE']
    ENV['USERPROFILE']
  elsif ENV['HOMEDRIVE'] and ENV['HOMEPATH']
    "#{ENV['HOMEDRIVE']}:#{ENV['HOMEPATH']}"
  else
    begin
      File.expand_path '~'
    rescue
      File.expand_path '/'
    end
  end
end

@aws_access_key_id = ENV['AWS_ACCESS_KEY_ID']
@aws_secret_access_key = ENV['AWS_SECRET_ACCESS_KEY']

if @aws_access_key_id.nil? and @aws_secret_access_key.nil?
  require 'yaml'
  cf = File.expand_path(File.join(get_home,'.s3conf','s3config.yml'))
  if File.exists? cf
    config = YAML::load_file(cf)
    @aws_access_key_id = config['AWS_ACCESS_KEY_ID']
    @aws_secret_access_key = config['AWS_SECRET_ACCESS_KEY']
  end
end

if @aws_access_key_id.nil?
  $stderr.puts "Missing AWS_ACCESS_KEY_ID key. Either set as environment variable or add in YAML file at ~/.s3conf/s3config.yml"
  exit 1
end

if @aws_secret_access_key.nil?
  $stderr.puts "Missing AWS_SECRET_ACCESS_KEY key. Either set as environment variable or add in YAML at ~/.s3conf/s3config.yml"
  exit 1
end


AWS::S3::Base.establish_connection!(
    :access_key_id     => @aws_access_key_id,
    :secret_access_key => @aws_secret_access_key
)

tempdir = "/tmp/#{$$}.tmp"

FileUtils.mkdir tempdir
at_exit { FileUtils.rm_rf tempdir }

if @fullrelease
  FileUtils.cp_r "#{dir}/.",tempdir

  jsfile = File.join(tempdir,"javascripts","appcelerator-debug.js")

  if not File.exists? jsfile
    $stderr.puts "Couldn't find required file at #{jsfile}"
    exit 1
  end

  @js = File.read jsfile

  def extract_version(label)
  	r = Regexp.new "#{label}\\: parseInt\\('([\\d])'\\)"
     m = @js.match(r)
     m ? m[1] : nil
  end

  def get_version
     extract_version('major') + '.' + extract_version('minor') + '.' + extract_version('revision')
  end

  sync_dirs = %w(javascripts stylesheets components widgets swf)

  # clean out stuff we don't want
  Dir["#{tempdir}/*"].each do |file|
  	next if sync_dirs.include? File.basename(file)
  	FileUtils.rm_rf file
  end

  version = get_version
  puts "+ Detected websdk version: #{version}"
end


@filetypes = {
	'.yml'=>'text/plain',
	'.js'=>'text/javascript',
	'.css'=>'text/css',
	'.rb'=>'text/plain',
	'.txt'=>'text/plain',
	'.swf'=>'application/x-shockwave-flash',
	'.md'=>'text/plain',
	'.png'=>'image/png',
	'.gif'=>'image/gif',
	'.jpg'=>'images/jpeg',
	'.ico'=>'image/x-icon',
	'.xml'=>'text/xml',
	'.html'=>'text/html',
	'.htc'=>'text/x-component',
	'.exe'=>'application/octet-stream',
	'.run'=>'application/octet-stream',
	'.dmg'=>'application/octet-stream',
	'.zip'=>'application/zip'
}

def compress?(fn)
	File.extname(fn) =~ /text\//
end

def compress(file)
	strio = StringIO.open('', 'w')
	gz = Zlib::GzipWriter.new(strio)
	if file.class == String
		gz.write file
   else
	  	gz.write(open(file).read)
   end
	gz.close
	strio.string
end

def uncompress(file)
	strio = StringIO.open(file)
	gz = Zlib::GzipReader.new(strio)
	gz.read
end

def enable_logging(name)
  if not AWS::S3::Bucket.logging_enabled_for? name
     puts "+ Enabling logging for: #{name}"
     AWS::S3::Bucket.enable_logging_for(name,'target_bucket'=>LOG_BUCKET, 'target_prefix'=> "#{name}_log_")
  end 
end

def make_script(obj)
  "/*-secure-\n#{obj.to_json}\n*/"
end

def fetch_js(file,bucket)
  entry = AWS::S3::S3Object.find(file, bucket) rescue nil
  return nil unless entry
  data = entry.content_encoding == 'gzip' ? uncompress(entry.value) : entry.value
  data.gsub!(/^\/\*-secure-([\s\S]*)\*\/\s*$/,'\1')
  JSON.parse(data.strip)
end

def checksum(file)
  f = File.open file,'rb'
  md5 = Digest::MD5.hexdigest f.read
  f.close
  md5
end

def add_to_manifest(changed,type,name,version,dependencies,path,file,cs)
  types = @release_manifest[type] || []
  types.delete_if {|entry| entry[:name] == name} unless types.empty?
  url = "#{DISTRO_SITE}/#{path}"
  size = File.size(file)
  @total+=size
  @files_changed << "The #{type} #{name}/#{version} was released." if changed
  types << {:name=>name,:filesize=>size,:checksum=>cs,:version=>version,:url=>url,:dependencies=>dependencies}
  @release_manifest[type]=types
  @websdk = true if changed and type == 'websdk'
end


[CODE_BUCKET,DISTRO_BUCKET,TRACKER_BUCKET].each do |name|
  enable_logging name
end

@files_changed = []
@release_manifest=fetch_js('manifest.js',DISTRO_BUCKET) || {}

def release_bundle(file)

  type = nil
  name = nil
  file_version = nil
  dependencies = nil
  
  Zip::ZipFile.open(file, Zip::ZipFile::CREATE) do |zipfile|
	  config_data = zipfile.read('build.yml') rescue nil

	  if config_data.nil?
	    $stderr.puts "Couldn't find build.yml in #{file}... skipping!!!"
	    break
    end

		config = YAML::load(config_data) rescue nil

	  if config.nil?
	    $stderr.puts "Couldn't load build.yml in #{file}... skipping!!!"
	    break
    end
    
	  type = config[:type]
	  name = config[:name]
	  file_version = config[:version]
	  dependencies = config[:dependencies] || []
  end
  
  return if type.nil?
  
  path = "#{type}/#{name.gsub(':','_')}/#{file_version}/#{File.basename(file)}"
  content_type = @filetypes[File.extname(file)] || 'binary/octet-stream'
  cs = checksum(file)
  
  current = AWS::S3::S3Object.find(path,DISTRO_BUCKET) rescue nil
  skipped = false
  rcs = current.metadata[:checksum] rescue nil

  if not current or rcs != cs
    AWS::S3::S3Object.store(
      path,
      open(file),
      DISTRO_BUCKET,
      :content_type => content_type,
      :access=>:public_read,
      :expires=> EXPIRES
    )
    current = AWS::S3::S3Object.find(path,DISTRO_BUCKET)
    current.metadata[:checksum] = cs
    current.store
  else
    skipped = true
  end

  puts "+ stored: #{DISTRO_SITE}/#{path} => #{File.size(file)}k, #{content_type} " + (skipped ? '(Skipped)':'') 

  add_to_manifest(!skipped,type,name,file_version,dependencies,path,file,cs)
end

if @fullrelease
  Dir["#{stage_dir}/*"].each do |file|
    next unless File.extname(file) == '.zip'
    next if file =~ /all_[a-z]+\.zip$/
    release_bundle file
  end
  puts "+ storing: #{DISTRO_SITE}/manifest.js"
  
  AWS::S3::S3Object.store(
      'manifest.js',
      compress(@release_manifest.to_json.to_s),
      DISTRO_BUCKET,
      :content_type => @filetypes['.js'],
      :access=>:public_read,
      :expires=> EXPIRES,
      :content_encoding => 'gzip' 
  )
else
  target_files.each do |file|
    next unless File.extname(file) == '.zip'
    release_bundle file
  end
end

if @websdk
  manifest = {:entries=>[]} 

  Dir["#{tempdir}/**/*"].each do |file|
    next if File.directory? file
    path = version + file.gsub(tempdir,'')
    content_type = @filetypes[File.extname(file)] || 'binary/octet-stream'
    manifest[:entries] << {'name'=>path,'size'=>File.size(file),'content-type'=>content_type}

    puts "+ storing: #{CODE_SITE}/#{path} => #{File.size(file)}k, #{content_type}" 

    if compress?(file)
       AWS::S3::S3Object.store(
        path,
        compress(file),
        CODE_BUCKET,
        :content_type => content_type,
        :access=>:public_read,
        :expires=> EXPIRES,
        :content_encoding => 'gzip' 
      )
    else
       AWS::S3::S3Object.store(
        path,
        open(file),
        CODE_BUCKET,
        :content_type => content_type,
        :access=>:public_read,
        :expires=> EXPIRES
      )
    end
    @total+=File.size(file)
  end

  puts "+ stored #{manifest[:entries].length} files at code.appcelerator.org"

  puts "+ storing: #{CODE_SITE}/#{version}/manifest.js"

  AWS::S3::S3Object.store(
      "#{version}/manifest.js",
      compress(manifest.to_json.to_s),
      CODE_BUCKET,
      :content_type => @filetypes['.js'],
      :access=>:public_read,
      :expires=> EXPIRES,
  	  :content_encoding => 'gzip' 
  )

  releases = {:releases=>[], :latest=>version}

  if AWS::S3::S3Object.exists?('releases.js',CODE_BUCKET)
    code = fetch_js('releases.js',CODE_BUCKET)
    releases[:releases]=code['releases']
  end

  # delete current
  releases[:releases].delete_if { |e| e['version'] == version }

  releases[:releases] << {'version'=>version,'date'=>Time.now}

  puts "+ storing: #{CODE_SITE}/releases.js"

  AWS::S3::S3Object.store(
      'releases.js',
      compress(make_script(releases)),
      CODE_BUCKET,
      :content_type => @filetypes['.js'],
      :access=>:public_read,
      :expires=> EXPIRES,
  	 :content_encoding => 'gzip' 
  )

  HTML=<<-END
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml" dir="ltr">
  <head>
  		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  		<title>Appcelerator Code Repository</title>
      <script type="text/javascript" src="/#{version}/javascripts/appcelerator.js"></script>
      <style type="text/css">
        img {border:none} 
        .release {font-size:18px; margin: 3px; line-height: 32px; border:1px solid #ccc; padding:4px; padding-left:20px;}
      </style>
      <link rel="shortcut icon" href="favicon.ico"/>
      <link rel="alternate" type="application/rss+xml" title="Appcelerator Releases RSS Feed" href="#{CODE_SITE}/feed" />
  </head>
  <body>
  <div style="font-family:Tahoma,Arial,Helvetica;font-size:24px;color:#222;margin:10px;">
          <a href="http://appcelerator.org" title="Visit the Appcelerator Developer Community">
              <img src="logo.png" alt="Appcelerator Logo" align="left" border="0"/>
          </a>
          <div style="margin-top:35px;margin-left:100px;float:left;line-height:60px;">
              <div>Welcome to the Appcelerator Code Respository</div>

              <div><strong>We want to help you build better apps, fast.</strong></div>

              <div class="release">
                <div>The current version is: <strong>#{version}</strong></div>
                <div>Released on: <strong>#{Time.now.strftime('%m/%d/%Y')}</strong></div>
              </div>

              <div style="margin-top:30px;font-size:20px;line-height:30px">
                  <div>Some resources that will be helpful:</div>
                  <div>
                      <ul>
                          <li><a style="color:#ae2917;" href="http://appcelerator.org">Appcelerator Developer Community</a></li>
                          <li><a style="color:#ae2917;" href="http://doc.appcelerator.org">Appcelerator Reference Documentation</a></li>
                          <li><a style="color:#ae2917;" href="http://www.appcelerant.com">Appcelerant - the Appcelerator Developer Blog</a></li>
                          <li><a style="color:#ae2917;" href="http://www.appcelerator.com">Appcelerator Professional Support</a></li>
                      </ul>
                  </div>
              </div>

              <div style="margin-top:110px;font-size:12px;line-height:12px;color:#777;">
                  <div>
                      <a style="color:#777;" 
                      href="http://appcelerator.org">Appcelerator</a> 
                      is Copyright &copy; 2007-2008 by <a href="http://www.appcelerator.com" style="color:#777;">Appcelerator, Inc.</a> 
                      and is licensed under the <a href="http://license.appcelerator.org" style="color:#777;">Apache License 2.0</a></a>.
                  </div>
                  <div>Appcelerator is a trademark of Appcelerator, Inc.</div>
              </div>
          </div>
      </div>
  </body>
  </html>
  END

  puts "+ storing: #{CODE_SITE}/index.html"

  AWS::S3::S3Object.store(
      'index.html',
      compress(HTML),
      CODE_BUCKET,
      :content_type => @filetypes['.html'],
      :access=>:public_read,
      :expires=> EXPIRES,
  	  :content_encoding => 'gzip' 
  )


  XML=<<-END
  <?xml version="1.0" encoding="UTF-8"?>
  <appcelerator version="1.0" xmlns="http://appcelerator.org/config">
      <servicebroker disabled="true" poll="false" marshaller="application/json">@{rootPath}servicebroker</servicebroker>
      <upload></upload>
      <download></download>
      <proxy></proxy>
      <sessionid></sessionid>
      <language>javascript</language>
      <service>web</service>
  </appcelerator>
  END

  puts "+ storing: #{CODE_SITE}/#{version}/appcelerator.xml"


  AWS::S3::S3Object.store(
      "#{version}/appcelerator.xml",
      compress(XML),
      CODE_BUCKET,
      :content_type => @filetypes['.xml'],
      :access=>:public_read,
      :expires=> EXPIRES,
  	  :content_encoding => 'gzip' 
  )
end

def rss_date(d)
  d.gmtime.strftime('%a, %d %b %Y %H:%M:%s +0000')
end

def rss_header(url,link,title,description)
  content=<<-END
  <?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0"
  	xmlns:content="http://purl.org/rss/1.0/modules/content/"
  	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  	xmlns:dc="http://purl.org/dc/elements/1.1/"
  	xmlns:atom="http://www.w3.org/2005/Atom"
  	>

  <channel>
  	<title>#{title}</title>
  	<atom:link href="#{url}" rel="self" type="application/rss+xml" />
  	<link>#{link}</link>
  	<description>#{description}</description>
  	<pubDate>#{rss_date(Time.now)}</pubDate>
  	<generator>Appcelerator</generator>
  	<language>en</language>
  END
  content
end


if @websdk
  RSS_HEADER = rss_header "#{CODE_SITE}/feed","#{CODE_SITE}/index.html",'Appcelerator Releases','Appcelerator Code Respository Release Feed'

  RSS_FOOTER=<<-END
  </channel>
  </rss>
  END

  rss = RSS_HEADER

  releases[:releases].each do |release|
    item = <<-END
      <item>
        <title>Release #{release['version']} is available</title>
        <link>#{CODE_SITE}/index.html</link>
        <pubDate>#{rss_date(release['date'])}</pubDate>
        <description>Release #{release['version']} available on #{release['date']}</description>
      </item>
    END
    rss << item
  end

  rss << RSS_FOOTER


  puts "+ storing: #{CODE_SITE}/feed"

  AWS::S3::S3Object.store(
      'feed',
      rss.strip,
      CODE_BUCKET,
      :content_type => 'application/rss+xml',
      :access=>:public_read,
      :expires=> EXPIRES
  )
end


if not @files_changed.empty?

  RELEASE_RSS_HEADER = rss_header "#{DISTRO_SITE}/feed","http://appcelerator.org",'Appcelerator Distribution Releases','Appcelerator Distribution Respository Release Feed'

  value = open("#{DISTRO_SITE}/feed").read rescue nil
  if not value
    value = RELEASE_RSS_HEADER + "<item/>" + RSS_FOOTER
  end

  idx = value.index '<item/>'
  
  if idx 
    value.gsub!('<item/>',"\n")
  else
    idx = value.index '<item>'
    idx-=1
  end
  
  description = @files_changed.join("\n")
  
  item = <<-END
    <item>
      <title>#{@files_changed.size} distribution component#{@files_changed.size>1?'s':''} #{@files_changed.size>1?'have':'has'} been released</title>
      <link>http://appcelerator.org</link>
      <pubDate>#{rss_date(Time.now)}</pubDate>
      <description>#{description}</description>
    </item>
  END
  
  value = value[0,idx] + item + value[idx+1..-1]
  
  puts "+ storing: #{DISTRO_SITE}/feed -- #{@files_changed.size} files changed"
  
  AWS::S3::S3Object.store(
      'feed',
      value.strip,
      DISTRO_BUCKET,
      :content_type => 'application/rss+xml',
      :access=>:public_read,
      :expires=> EXPIRES
  )

end


puts "+ Completed! #{@total}k bytes transferred"

