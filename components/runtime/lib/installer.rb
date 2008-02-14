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
require 'open-uri'

module Appcelerator
  class Installer
    
    @@packages = nil
    @@bundles = nil
    @@widgets = nil
    @@client = nil
    @@username = nil
    @@password = nil
    @@config = nil
    @@notice = false
    @@loggedin = false
    
    def Installer.user_home
      if ENV['HOME']
          ENV['HOME']
      elsif ENV['USERPROFILE']
          ENV['USERPROFILE']
      elsif ENV['HOMEDRIVE'] and ENV['HOMEPATH']
          "#{ENV['HOMEDRIVE']}:#{ENV['HOMEPATH']}"
      else
          File.expand_path '~'
      end
    end

    def Installer.load_config
      # load our config
      config_dir = File.join(user_home,'.appc')
      FileUtils.mkdir(config_dir) unless File.exists?(config_dir)
      @@config_file = File.join(config_dir,'appcelerator.yml')
      @@config = YAML::load_file(@@config_file) if File.exists?(@@config_file)
      @@config||={}
    end
    
    def Installer.save_config(username,password)
      @@config[:username]=username
      @@config[:password]=password
      f = File.open(@@config_file,'w+')
      f.puts @@config.to_yaml
      f.flush
      f.close
    end
    
    def Installer.prompt_username(label='Username')
      ask_with_validation "#{label}:",'Invalid email. Please enter your email address as your username',/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
    end
    
    def Installer.prompt_password(confirm=nil)
      if confirm
        ask_with_validation 'Password (confirm):','Password did not match previous entry', Regexp.new("^#{confirm}$"), true
      else
        ask_with_validation 'Password:','Invalid password. Must be greater than 4 characters', /[.\w\d_!@#\$%_-]{4,100}/, true
      end
    end

    def Installer.get_client
      @@client = ServiceBrokerClient.new ET_PHONE_HOME, OPTIONS[:debug] unless @@client
      @@client
    end

    def Installer.signup(email,firstname,lastname,password)
      client = get_client
      result = client.send 'account.signup.request', {'offline'=>true,'email'=>email,'password'=>password,'firstname'=>firstname,'lastname'=>lastname}
      puts "result=>#{result.to_yaml}" if OPTIONS[:debug] and result
      result ? result[:data] : {'success'=>false,'msg'=>'invalid response from server'}
    end

    def Installer.validate_signup(email,password,verification)
      client = get_client
      result = client.send 'account.confirmation.request', {'offline'=>true,'confirmation'=>verification}
      puts "result=>#{result.to_yaml}" if OPTIONS[:debug] and result
      result ? result[:data] : {'success'=>false,'msg'=>'invalid response from server'}
    end

    def Installer.network_login(email,password,silent=false)
      puts "Using network URL: #{ET_PHONE_HOME}" if OPTIONS[:debug]
      puts "Checking update server ..." unless OPTIONS[:silent] or silent
      client = get_client
      result = client.send 'account.login.request', {'email'=>email,'password'=>password}
      puts "result=>#{result.to_yaml}" if OPTIONS[:debug] and result
      return result[:data]['success'] if result
      false
    end
    
    def Installer.login_if_required
      Installer.login unless @@loggedin
    end

    def Installer.login(un=nil,pw=nil)
      username = @@config[:username] unless un
      password = @@config[:password] unless pw
      while true 
        if username and password
  			  break if Installer.network_login(username,password)
  			  puts "Invalid credentials, please try again..."
			  end
        username = prompt_username
        password = prompt_password
      end
      
      @@loggedin = true
      @@username = username
      @@password = password
      
      puts "Logged in" if OPTIONS[:debug]
      
      Installer.save_config(@@username,@@password)
      
      @@loggedin
    end
    
    def Installer.show_notice
      if not @@notice and not OPTIONS[:quiet]
        puts "Updating installed components ..."
        @@notice=true
      end
    end

    def Installer.get_latest(name=nil)
      begin
        Installer.login_if_required
      rescue => e
        puts "Failed to connect to network for login, exception => #{e}" if OPTIONS[:debug] or OPTIONS[:verbose]
        return nil,nil,nil,nil
      end
      
      show_notice
      
      if not @@packages
        result = @@client.send 'releases.latest.request'
        return nil,nil unless result[:data]['success']
        @@packages = result[:data]['pkgs']
        @@bundles = result[:data]['bundles']
        @@widgets = result[:data]['widgets']
      end
      if name
        @@packages.each do |pkg|
          if pkg['name'] == name
            return pkg,@@packages,@@bundles,@@widgets
          end
        end
      end
      return nil,@@packages,@@bundles,@@widgets
    end
        
    def Installer.get_latest_sdk
      get_latest 'web'
    end
    
    def Installer.get_latest_service(lang)
      get_latest lang
    end
    
    def Installer.current_user
      #TODO: windows?
      require 'etc'
      uid=File.stat(APP_TEMP_DIR.to_s).uid
      Etc.getpwuid(uid).name
    end
    
    def Installer.admin_user?
      # ignore for win32 system
      return true if RUBY_PLATFORM =~ /mswin32$/
      
      # must be root user for unix
      un = current_user
      'root'==un
    end
    
    def Installer.require_admin_user
      if not admin_user?
        STDERR.puts
        STDERR.puts "*" * 80
        STDERR.puts
        STDERR.puts "ERROR: Administrative Privileges Required"
        STDERR.puts
        STDERR.puts "This operation requires you to be logged in as root/administrator user."
        STDERR.puts "Please login or sudo as root/administrator and re-run this command again."
        STDERR.puts
        STDERR.puts "*" * 80
        STDERR.puts
        exit 1
      end
    end
    
    def Installer.http_fetch_into(name,url,target)
      temp_dir = http_fetch(name,url)
      if temp_dir
        puts "extracting #{temp_dir} to #{target}" if OPTIONS[:debug]
        FileUtils.cp_r "#{temp_dir}/.", target
        true
      end
      false
    end
    
    def Installer.same_host?(a,b)
      if a =~ /localhost|127\.0\.0\.1|0\.0\.0\.0/
          return b =~ /localhost|127\.0\.0\.1|0\.0\.0\.0/
      end
      a==b
    end
    
    def Installer.http_fetch(name,url)
      puts "Attempting to fetch #{name} from #{url}" if OPTIONS[:debug]
      begin
        Installer.login_if_required
      rescue => e
        puts "Failed to connect to network for login, exception => #{e}" 
        return nil
      end
      pbar=nil
      dirname=nil
      uri = URI.parse(url)
      home_uri = URI.parse(ET_PHONE_HOME)
      cookies = ''
        if same_host?(uri.host,home_uri.host) and uri.port == home_uri.port
        cookies = @@client.cookies.to_s
      end
      puts "Session cookies: #{cookies}" if OPTIONS[:debug]
      open(url,'Cookie'=>cookies,:content_length_proc => lambda {|t|
            if t && 0 < t
              if not OPTIONS[:quiet]
                require "#{LIB_DIR}/progressbar"
                pbar = ProgressBar.new(name, t)
                pbar.file_transfer_mode
              end
            end
          },
          :progress_proc => lambda {|s|
            pbar.set s if pbar
          }) do |f|
        
            if f.status[0] == '200'
              tmpdir = tempdir
              t = tempfile(tmpdir)
              t.write f.read
              t.flush
              t.close
              size = File.size(t.path)
              dirname = File.dirname(t.path)
              if url =~ /\.tgz$/
                #FIXME - deal with windows or bundle in windows or something - or figure out how to do in ruby
                system "tar xfz #{t.path} -C #{dirname}"
              elsif url =~ /\.zip$/
                Installer.unzip dirname,t.path
                FileUtils.rm_r t.path
                puts "Downloaded: #{size} bytes" if OPTIONS[:debug]
              end
            else
              STDERR.puts "Error fetching #{name}. Distribution server returned status code: #{f.status.join(' ')}."
              exit 1
            end
      end
      puts if pbar
      dirname
    end
    
    def Installer.unzip(dirname,path)
      require 'zip/zip'
      Zip::ZipFile::open(path) do |zf|
        zf.each do |e|
          fpath = File.join(dirname, e.name)
          FileUtils.mkdir_p(File.dirname(fpath))
          puts "extracting ... #{fpath}" if OPTIONS[:debug]
          zf.extract(e, fpath) 
        end
        zf.close
      end
    end
    
    def Installer.tempdir
      dir = File.expand_path(File.join(APP_TEMP_DIR,"#{$$}_#{rand(100000)}"))
      FileUtils.mkdir_p dir
      dir
    end
    
    def Installer.tempfile(dir=APP_TEMP_DIR)
      File.new(File.expand_path(File.join(dir,"#{$$}_#{rand(100000)}")),"w+")
    end

    def Installer.put(path,content)
      if File.exists?(path)
        puts "Writing content to #{path}" if OPTIONS[:debug]
        confirm("Overwrite [#{path}]? (Y)es,(N)o,(A)ll [Y]") if not OPTIONS[:quiet] and not OPTIONS[:force]
      end
      f = File.open(path,'w+')
      f.puts content
      f.flush
      f.close
    end

    def Installer.mkdir(path)
      case path.class.to_s
        when 'String'
          FileUtils.mkdir_p path unless File.exists?(path)
        when 'Array'
          path.each do |p|
            mkdir p
          end
      end
    end
    
    def Installer.copy(from_path,to_path,excludes=nil)
      
      puts "Copy called from: #{from_path} => to: #{to_path}, excludes=> #{excludes}" if OPTIONS[:debug]
      
      if File.exists?(from_path) and File.file?(from_path)
        FileUtils.cp from_path,to_path
        return true
      end
      
      Dir["#{from_path}/**/*"].each do |file|
        if excludes
          found = false
          excludes.each do |e|
            if file =~ Regexp.new("#{e}$")
               found = true
               next
            end
          end
          next if found
        end
        target_file = file.gsub(from_path,'')
        target = File.join(to_path,target_file)
        if File.directory?(file) and not File.exists?(target)
          puts "Creating directory #{target}" if OPTIONS[:verbose]
          FileUtils.mkdir(target)
        end
        if File.file?(file) 
          puts "Copying #{file} to #{target}" if OPTIONS[:verbose]
          confirm("Overwrite [#{target}]? (Y)es,(N)o,(A)ll [Y]") if File.exists?(target) and not OPTIONS[:quiet] and not OPTIONS[:force]
          FileUtils.copy(file,target)
        end
      end
      true
    end

    def Installer.install_component(type,description,from,to,quiet=false)

      temp_dir = nil
      name = nil
      version = nil
      url = nil
      
      if File.exists? from

        if not from =~ /(.*)\.zip$/
          STDERR.puts "* Invalid description format at: #{from}. #{description} should be in zip format."
          exit 1
        end

        # unzip to temporary directory
        temp_dir = Appcelerator::Installer.tempdir
        Appcelerator::Installer.unzip temp_dir, from

        puts "extracted #{from} into tempdir => #{temp_dir}" if OPTIONS[:debug]
      else
        case from
          when /^http:\/\//
            url = from
          when /^\w+([:_]\w+)?$/

            pkg,packages,bundles,widgets=Installer.get_latest
            
            puts "pkg=#{pkg}"
            puts "packages=#{packages}"
            puts "bundles=#{bundles}"
            puts "widgets=#{widgets}"
            
            if not widgets
              STDERR.puts "Couldn't login to the network to install #{from}"
              STDERR.puts "Check your network connection and try again."
              exit 1
            end
            
            array=nil
            case type
              when 'widget'
                array = widgets
              when 'service'
                array = packages
            else
              STDERR.puts "Type: #{type} not yet supported!"
              exit 1
            end
            
            #TODO: check the checksum
            
            array.each do |w|
              if w['name'] == from
                  url = w['url']
                  break
              end
            end
        end
      end

      if url
        temp_dir = Appcelerator::Installer.tempdir unless temp_dir
        begin
          Installer.http_fetch_into(description,url,temp_dir)
        rescue OpenURI::HTTPError => e
          if e.to_s =~ /^404/
            STDERR.puts "Couldn't fetch #{description} from #{from}"
            STDERR.puts "The server reported that a file doesn't exist at this location"
          else
            STDERR.puts "Network error fetching #{from}: #{e}"
          end     
          exit 1
        end
      end
      
      if temp_dir
        puts "temp directory used by install component: #{temp_dir}" if OPTIONS[:debug]
        
        begin
          if not File.exists?("#{temp_dir}/build.yml")
            STDERR.puts "* Invalid #{description} at: #{from}.\n#{description} missing build.yml"
            exit 1
          end

          config = YAML.load_file("#{temp_dir}/build.yml")
          component_name = config[:name]
          version = config[:version]
          same = name==component_name
          name = component_name.gsub(':','_')

          if same
            path = "#{to}/#{version}"
            config_path = "#{to}"
          else
            path = "#{to}/#{name}/#{version}"
            config_path = "#{to}/#{name}"
          end

          FileUtils.mkdir_p path unless File.exists?(path)


          Appcelerator::PluginManager.dispatchEvent 'before_install_#{type}',from,component_name,version,path

          puts "install path => #{path}" if OPTIONS[:debug]

          Appcelerator::Installer.copy(temp_dir,path,['build.yml'])

          config = {:version=>version}
          Appcelerator::Installer.put "#{config_path}/config.yml",config.to_yaml.to_s 

          pre_flight = File.join(to,name,version.to_s,'pre_flight.rb')
          require pre_flight if File.exists?(pre_flight)

          Appcelerator::PluginManager.dispatchEvent 'after_install_#{type}',from,name,version,path

          puts "Installed #{description}: #{name},#{version}" unless (OPTIONS[:quiet] or quiet)
        ensure
          FileUtils.rm_r temp_dir
        end
      else
        STDERR.puts "Couldn't find #{description}: #{from}" unless OPTIONS[:quiet]
        exit 1
      end
    end
  end
end