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
require 'digest/md5'

module Appcelerator
  class Installer
    
    @@client = nil
    @@username = nil
    @@password = nil
    @@config = nil
    @@notice = false
    @@loggedin = false
    @@distributions = nil
    @@site_config = nil
    @@site_config_file = nil
    @@installed_in_session = Array.new
    
    def Installer.user_home
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
    
    def Installer.get_config
      return @@config if @@config
      load_config
    end

    def Installer.load_config
      # load our config
      @@config_file = File.join(RELEASE_DIR,'login.yml')
      @@config = YAML::load_file(@@config_file) if File.exists?(@@config_file)
      @@config||={}
    end
    def Installer.forget_credentials
      Installer.load_config unless @@config
      @@config.delete :username
      @@config.delete :password
      Installer.save_config
    end
    
    def Installer.save_config(username=nil,password=nil)
      @@config[:username]=username if username
      @@config[:password]=password if password
      f = File.open(@@config_file,'w+')
      f.puts @@config.to_yaml
      f.flush
      f.close
    end
    
    def Installer.prompt_username(label='Email')
      ask_with_validation "#{label}:",'Invalid email. Please enter your email address',/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
    end
    
    def Installer.prompt_password(confirm=nil)
      if confirm
        ask_with_validation 'Password (confirm):','Password did not match previous entry', Regexp.new("^#{confirm}$"), true
      else
        ask_with_validation 'Password:','Invalid password. Must be greater than 4 characters', /[.\w\d_!@#\$%_-]{4,100}/, true
      end
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
      die "No remote has been specified and you need to go to the Dev Network for content." if OPTIONS[:no_remote]
      puts "Using network URL: #{OPTIONS[:server]}" if OPTIONS[:debug]
      puts "Connecting to update server ..." unless OPTIONS[:silent] or silent or OPTIONS[:quiet]
      client = get_client
      result = client.send 'account.login.request', {'email'=>email,'password'=>password}
      puts "result=>#{result.to_yaml}" if OPTIONS[:debug] and result
      return result[:data]['success'] if result
      false
    end
    
    def Installer.login_if_required
      die "No remote has been specified and you need to go to the Dev Network for content." if OPTIONS[:no_remote]
      Installer.login unless @@loggedin
    end

    def Installer.get_client
      if @@client
        return @@client
      else
        @@client = ServiceBrokerClient.new OPTIONS[:server], OPTIONS[:debug] unless @@client
      end
      @@client
    end
    def Installer.get_proxy
      if !@@config[:proxy].nil?
        puts "proxy in config: #{@@config[:proxy]}" if OPTIONS[:debug]
        return @@config[:proxy]
      elsif !@@config[:proxy_host].nil? and !@@config[:proxy_port].nil?
        puts "proxy in config: http://#{@@config[:proxy_host]}:#{@@config[:proxy_port]}" if OPTIONS[:debug]
        return "http://#{@@config[:proxy_host]}:#{@@config[:proxy_port]}"
      elsif !ENV['http_proxy'].nil? and !(ENV['http_proxy']=="")
        puts "proxy in ENV['http_proxy']: #{ENV['http_proxy']}" if OPTIONS[:debug]
        return ENV['http_proxy']
      elsif !ENV['HTTP_PROXY'].nil? and !(ENV['HTTP_PROXY']=="")
        puts "proxy in ENV['HTTP_PROXY']: #{ENV['HTTP_PROXY']}" if OPTIONS[:debug]
        return ENV['HTTP_PROXY']
      else
        puts "proxy nil" if OPTIONS[:debug]
        return nil
      end
    end
    def Installer.login(un=nil,pw=nil,exit_on_failure=false)
      die "No remote has been specified and you need to go to the Dev Network for content." if OPTIONS[:no_remote]
      username = un.nil? ? @@config[:username] : un
      password = pw.nil? ? @@config[:password] : pw
      if not @@loggedin or (username.nil? or password.nil?) or (@@loggedin and (username != @@config[:username] or password != @@config[:password]))
        while true 
          if username and password
    			  break if Installer.network_login(username,password,false)
    			  STDERR.puts "Invalid credentials, please try again..."
    			  return false if exit_on_failure
  			  end
          username = prompt_username
          password = prompt_password
          
          Installer.prompt_proxy(true)
        end
      end
      
      @@loggedin = true
      @@username = username
      @@password = password
      
      puts "Logged in" if OPTIONS[:verbose]
      
      Installer.save_config(@@username,@@password)
      
      @@loggedin
    end
    def Installer.save_proxy(proxy)
      @@config[:proxy]=proxy
      @@config[:proxy_host]=nil
      @@config[:proxy_port]=nil
      f = File.open(@@config_file,'w+')
      f.puts @@config.to_yaml
      f.flush
      f.close
    end
    
    def Installer.prompt_proxy(save=false)
      envproxy = ENV['HTTP_PROXY'] || ENV['http_proxy']
      if !envproxy.nil? && !(envproxy == '')
        yn = ask "Detected http_proxy environment variable #{envproxy}, do you want to use this? (Y)es or (N)o [Y]"
        if ['y','Y',''].index(yn)
          if save
            Installer.save_proxy(nil)
          end
          return nil
        else
          proxy = ask('Proxy url (ex: http://myuser:mypass@my.example.com:3128):')
          if save
            Installer.save_proxy(proxy)
          end
          return proxy
        end
      end
      yn = ask 'Are you using a proxy server? (Y)es or (N)o [Y]'
      if ['y','Y',''].index(yn)
        proxy = ask('Proxy url (ex: http://myuser:mypass@my.example.com:3128):')
        if save
          Installer.save_proxy(proxy)
        end
        return proxy
      else
        return nil
      end
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
      home_uri = URI.parse(OPTIONS[:server])
      cookies = ''
        if same_host?(uri.host,home_uri.host) and uri.port == home_uri.port
        cookies = @@client.cookies.to_s
      end
      puts "Session cookies: #{cookies}" if OPTIONS[:debug]

      proxy = Installer.get_proxy()
      if proxy.nil? or proxy==""
        proxy = false
      else
        puts "using proxy #{proxy}"
      end
      open(url,'Cookie'=>cookies,:proxy=>proxy,:content_length_proc => lambda {|t|
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
                #system "tar xfz #{t.path} -C #{dirname}"
              elsif url =~ /\.zip$/ or f.content_type =~ /^application\/zip/
                Installer.unzip dirname,t.path
                FileUtils.rm_r t.path
                puts "Downloaded: #{size} bytes" if OPTIONS[:debug]
              end
            else
              die "Error fetching #{name}. Distribution server returned status code: #{f.status.join(' ')}."
            end
      end
      puts if pbar
      dirname
    end
    
    def Installer.unzip(dirname,path)
      require 'zip/zip'
      puts "Extracting #{path} to #{dirname}" if OPTIONS[:debug]
      Zip::ZipFile::open(path) do |zf|
        zf.each do |e|
          fpath = File.join(dirname, e.name)
          FileUtils.mkdir_p(File.dirname(fpath))
          puts "extracting ... #{fpath}" if OPTIONS[:debug]
          if File.file?(fpath) 
            confirm("Overwrite [#{fpath}]? (Y)es,(N)o,(A)ll [Y]") if not OPTIONS[:quiet] and not OPTIONS[:force]
            FileUtils.rm_rf(fpath)
          end
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
      f = File.new(File.expand_path(File.join(dir,"#{$$}_#{rand(100000)}")),'wb')
      APP_TEMP_FILES << f
      f
    end
    
    def Installer.put(path,content,force=false)
      if File.exists?(path)
        puts "Writing content to #{path}" if OPTIONS[:debug]
        confirm("overwrite [#{path}]? (Y)es,(N)o,(A)ll [Y]") if not OPTIONS[:quiet] and not OPTIONS[:force] and not force
      end
      f = File.open(path,'w+')
      f.puts content
      f.flush
      f.close
    end

    #TODO: tx?
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
    
    def Installer.confirm_copy(from,destination)
        return :force if OPTIONS[:force]
        return :force unless File.exists?(destination)
        return :skip if Installer.same_file?(from,destination)
        while true
          STDOUT.print "overwrite #{destination}? (enter \"h\" for help) [Ynbaqdh] "
          STDOUT.flush
          case STDIN.gets.chomp
            when /\Ad\z/i
              #FIXME: win32 package sdiff in installer
              fork do
                 exec "sdiff \"#{destination}\" \"#{from}\" | less"
              end
              Process.wait
            when /\Aa\z/i
              STDOUT.puts "forcing #{from}"
              OPTIONS[:force] = true
              return :force
            when /\Ab\z/i
              return :backup
            when /\Aq\z/i
              STDOUT.puts "aborting from copy #{from}"
              raise SystemExit
            when /\An\z/i then return :skip
            when /\Ay\z/i then return :force
            else
              STDOUT.puts <<-HELP
Y - yes, overwrite
n - no, do not overwrite -- skip copy of this file
b - no, do not overwrite but create backup file as <name>.backup
a - all, overwrite this and all others
q - quit, abort command
d - diff, show the differences between the old and the new
h - help, show this help
HELP
          end
      end
    end

    def Installer.do_cp_confirm(tx,from_path,to_path,force=false)
      if force
        tx.cp from_path,to_path
        return true
      end
      case confirm_copy from_path,to_path
        when :force
          tx.cp from_path,to_path
        when :backup
          tx.cp from_path,"#{to_path}.backup"
          tx.cp from_path,to_path
        when :skip
      end
      true
    end
    
    def Installer.copy(tx,from_path,to_path,excludes=nil,force=false)
      
      if from_path.class == Array
        from_path.each do |e|
          Installer.copy(tx,e,to_path,excludes,force)
        end
        return true
      end
      
      puts "Copy called from: #{from_path} => to: #{to_path}, excludes=> #{excludes}, force=#{force}" if OPTIONS[:debug]
      
      if File.exists?(from_path) and File.file?(from_path)
        if File.directory?(to_path)
          return do_cp_confirm(tx,from_path,File.join(to_path,File.basename(from_path)),force)
        end
        return do_cp_confirm(tx,from_path,to_path,force)
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
          tx.mkdir(target) unless File.exists?(target)
        end
        if File.file?(file) 
          puts "Copying #{file} to #{target}" if OPTIONS[:verbose]
          tx.mkdir File.dirname(target) unless File.exists?(target)
          do_cp_confirm tx,file,target,force
        end
      end
      true
    end
    
    def Installer.load_site_config
      return @@site_config if @@site_config
      FileUtils.mkdir_p RELEASE_DIR unless File.exists? RELEASE_DIR
      @@site_config_file = "#{RELEASE_DIR}/config.yml"
      @@site_config = YAML::load_file @@site_config_file if File.exists?(@@site_config_file)
      @@site_config||={}
      @@site_config
    end
    
    def Installer.save_site_config
      if @@site_config
        FileUtils.mkdir_p RELEASE_DIR unless File.exists? RELEASE_DIR
        f = File.open @@site_config_file, 'w+'
        f.puts @@site_config.to_yaml
        f.close
      end
    end
    
    def Installer.with_site_config(save=true)
      config = load_site_config
      yield config
      save_site_config if save
    end

    def Installer.convert_object(object)
      case object.class.to_s
        when 'Hash'
          return convert_hash_to_symbol_keys(object)
        when 'Array'
          return object.inject([]) do |array,value|
            array << convert_object(value)
          end
      end
      object
    end
    
    def Installer.convert_hash_to_symbol_keys(hash)
      hash.each do |key,value|
        hash.delete key
        hash[key.to_sym]=convert_object(value)
      end
      hash
    end
    
    def Installer.fetch_distribution_list(ping=false)
        return @@distributions if @@distributions
        login_if_required
        client = get_client
        puts "Fetching release info from distribution server..." unless OPTIONS[:quiet]
        config = get_config
        args = {'ping'=>ping,'sid'=>config[:sid],'os'=>RUBY_PLATFORM}
        response = client.send('distribution.query.request',args)
        if config[:sid].nil? or config[:sid]!=response[:data]['sid']
          config[:sid] = response[:data]['sid']
          save_config
        end
        @@distributions = convert_object(response[:data]['distributions'])
        with_site_config do |site_config|
          site_config[:distributions] = @@distributions
        end
        @@distributions
    end
    
    ##FIXME: need to make sure multiple versions can work and co-exist
    
    def Installer.each_installed_component_type
      with_site_config(false) do |site_config|
        installed = site_config[:installed]
        installed||={}
        installed.keys.each do |key|
          yield key.to_s
        end
      end
    end
    
    def Installer.each_installed_component(type)
      with_site_config(false) do |site_config|
        installed = site_config[:installed]
        installed||={}
        members = installed[type.to_sym]
        if members
          members.each do |member|
            yield member[:name],member[:version]
          end
        end
      end
    end
    
    def Installer.get_websdk
      with_site_config(false) do |site_config|
        installed = site_config[:installed]
        installed||={}
        members = installed[:websdk]
        if members
          members.each do |member|
            if member[:name] == 'websdk'
              return member
            end
          end
        end
      end
      nil
    end
    
    def Installer.component_installed?(component)
      type = component[:type]
      name = component[:name]
      version = component[:version]
      checksum = component[:checksum]
      filesize = component[:filesize]
      
      with_site_config(false) do |site_config|
        installed = site_config[:installed]
        installed||={}
        members = installed[type.to_sym]
        if members
          members.each do |member|
            if member[:name] == name
              v = member[:version]
              if v == version and member[:checksum]==checksum
                return true,component[:dependencies]
              end
            end
          end
        end
      end
      return false,nil
    end
    
    def Installer.find_dependencies_for(component)
      with_site_config(false) do |site_config|
        distro = site_config[:distributions]
        return nil unless distro
        members = distro[component[:type].to_sym]
        return nil unless members
        members.each do |m|
          if m[:name]==component[:name]
            return m[:dependencies]
          end
        end
      end
      nil
    end
    
    def Installer.dependency_specified?(component,dependencies)
      dependencies.each do |d|
        return true if d[:name]==component[:name] and d[:type]==component[:type]
      end
      false
    end
    
    def Installer.same?(a,b)
      a[:name]==b[:name] or a[:type]==b[:type]
    end
    
    def Installer.get_dependencies(component,dependencies=[])
      
      return [] unless component
      depends = component[:dependencies]
      return unless depends
      
      checked = Array.new

      depends.each do |d|
        next if same?(component,d)
        next if dependency_specified?(d,dependencies)
        next if @@installed_in_session.include? "#{d[:type]}_#{d[:name]}_#{d[:version]}"
        installed,depends = component_installed?(d)
        dependencies << d
        checked << d[:name]
      end
      
      # recursively resolve dependencies
      sweeps = 0
      while sweeps < 10
        count = 0
        dependencies.each do |d|
          sweeps+=1
          depends = find_dependencies_for(d)
          next unless depends
          depends.each do |dd|
            next if Installer.same?(dd,component)
            next if checked.include?(dd[:name])
            next if @@installed_in_session.include? "#{dd[:type]}_#{dd[:name]}_#{dd[:version]}"
            dependencies << dd
            count+=1
            checked << dd[:name]
          end
        end
        break unless count > 0
      end
      
      dependencies
    end
    
    def Installer.number_to_human_size(size, precision=1)
      size = size.nil? ? 0 : Kernel.Float(size)
      case
         when size.to_i == 1;    "1 Byte"
         when size < 1.kilobyte; "%d Bytes" % size
         when size < 1.megabyte; "%.#{precision}f KB"  % (size / 1.0.kilobyte)
         when size < 1.gigabyte; "%.#{precision}f MB"  % (size / 1.0.megabyte)
         when size < 1.terabyte; "%.#{precision}f GB"  % (size / 1.0.gigabyte)
       else                    "%.#{precision}f TB"  % (size / 1.0.terabyte)
      end.sub(/([0-9])\.?0+ /, '\1 ' )
      rescue
      size.to_s + ' bytes'
    end
    
    def Installer.get_and_install_dependencies(component,quiet=false)
      dependencies = get_dependencies(component)
      iterator_dependencies(dependencies,component,quiet) do |d,idx,len|
        yield d,idx,len
      end
    end
    
    def Installer.iterator_dependencies(dependencies,component,quiet=false)
      return nil unless dependencies
      if dependencies.length > 0
        
        if not OPTIONS[:force_update]
          dependencies = dependencies.inject([]) do |a,d|
            found = get_installed_component(d)
            if found
              puts "Dependent #{d[:type]} #{d[:name]}, #{d[:version]} already installed - skipping..."  if OPTIONS[:verbose]
            else
              a << d
            end
            a
          end
          return nil if dependencies.empty?
        end
        
        str = dependencies.length > 1 ? 'ies' : 'y'
        if not OPTIONS[:quiet]
          puts
          puts "(#{dependencies.length}) Dependenc#{str} resolved that requires download:"
          puts "-"*120
          puts "| " + 'Type'.center(9) + ' | ' + 'Name'.ljust(72) + ' | ' + 'Version'.center(10) + ' | ' + 'Filesize'.rjust(16) + ' |'
          puts "-"*120
          total = 0
          dependencies.each do |d|
            type = d[:type]
            name = d[:name]
            version = d[:version]
            filesize = d[:filesize]
            puts "| #{type.center(9)} | #{name.ljust(72)} | #{version.center(10)} | #{number_to_human_size(filesize).rjust(16)} |"
            puts "-"*120
            total+=filesize
          end
          filesize = 0
          filesize = component[:filesize] if component
          puts "Total download size (including component):" + number_to_human_size(total+filesize).rjust(76)
          puts
        end
        
        dependencies.each_with_index do |d,idx|
          yield d,idx,dependencies.length
        end
      end
    end
    
    def Installer.get_build_from_zip(zipfile)
      require 'zip/zip'
      Zip::ZipFile::open(zipfile) do |zf|
        build_contents = zf.read 'build.yml' rescue nil
        return YAML::load(build_contents)
      end
      nil
    end
    
    def Installer.get_component_directory(d)
      Installer.get_release_directory(d[:type],d[:name],d[:version])
    end
    
    def Installer.get_release_directory(type,name,version)
      "#{RELEASE_DIR}/#{type}/#{name.gsub(':','_')}/#{version}"
    end

    def Installer.fetch_network_component(type,component,count=1,total=1)
      to_dir = Installer.get_component_directory(component)
      puts "fetch network component from url: #{component[:url]}" if OPTIONS[:verbose]
      Installer.fetch_component(type,component[:name],component[:version],to_dir,component[:url],count,total)
      return to_dir,component[:name],component[:version],component[:checksum]
    end

    def Installer.fetch_network_url(type,from,config,url)
      to_dir = Installer.get_release_directory(config[:type],config[:name],config[:version])
      Installer.fetch_component(type,config[:name],config[:version],to_dir,url,1,1)
    end

    def Installer.fetch_component(type,name,version,to_dir,url,idx,total)
      puts "fetching into: #{to_dir} => #{url}" if OPTIONS[:debug]
      FileUtils.mkdir_p to_dir unless File.exists? to_dir
      event = {:to_dir=>to_dir,:from=>url,:type=>type,:name=>name,:version=>version}
      Appcelerator::PluginManager.dispatchEvent 'before_install_component',event
      Installer.http_fetch_into("(#{idx}/#{total}) #{name}",url,to_dir)
      Appcelerator::PluginManager.dispatchEvent 'after_install_component',event
    end
    
    def Installer.install_from_zipfile(type,description,from)
      config = Installer.get_build_from_zip from
      if not config
        die "Invalid package file #{from}. Missing build.yml"
      end
      to_dir = Installer.get_release_directory(config[:type],config[:name],config[:version])
      event = {:to_dir=>to_dir,:from=>from,:type=>config[:type],:name=>config[:name],:from=>from,:version=>config[:version]}
      Appcelerator::PluginManager.dispatchEvent 'before_install_component',event
      Installer.unzip to_dir,from
      Appcelerator::PluginManager.dispatchEvent 'after_install_component',event
      return to_dir,config[:name],config[:version]
    end

# :websdk,'WebSDK','websdk',true,tx,update
    def Installer.install_component(type,description,from,quiet_if_installed=false,tx=nil,force=false,skip_dependencies=false)

        to_dir = nil
        name = nil
        version = nil
        checksum = nil
        already_installed = false
        case from
          when /^http:\/\//
            #FIXME
            STDERR.puts "not yet supported - download directly and then re-run with zipfile"
            exit 1
          when /\.zip$/
            to_dir,name,version = Installer.install_from_zipfile(type,description,from)
            checksum = Installer.checksum(from)
        else
          to_dir,name,version,checksum,already_installed = Installer.install_from_devnetwork(type,description,from,quiet_if_installed,force,skip_dependencies)
        end
        
        if not already_installed
          puts "Fetched into #{to_dir}" if OPTIONS[:debug]

          # run pre_flight if it exists
          pre_flight = File.join(to_dir,'pre_flight.rb')
          if File.exists?(pre_flight)
            puts "Found pre-flight file at #{pre_flight}" if OPTIONS[:verbose]
            $Installer = Hash.new
            $Installer[:to_dir] = to_dir
            $Installer[:name] = name
            $Installer[:version] = version
            $Installer[:checksum] = checksum
            $Installer[:type] = type
            $Installer[:from] = from
            $Installer[:tx] = tx
            require pre_flight 
          end

          Installer.add_installed_component(name,type,version,checksum)
        end
        
        puts unless already_installed
        puts "Installed #{description}: #{name},#{version}" unless (OPTIONS[:quiet] or already_installed)
        puts "#{name} #{version} is already installed" if already_installed and not OPTIONS[:quiet] and not quiet_if_installed
        puts "NOTE: you can force a re-install with --force-update" if already_installed and OPTIONS[:verbose]
        
        return to_dir,name,version,checksum,already_installed
    end
    
    def Installer.installed_this_session?(type,name,version)
      @@installed_in_session.include? "#{type}_#{name}_#{version}"
    end
    
    def Installer.add_installed_component(name,type,version,checksum,save=true)
      type = type.to_s
      with_site_config(save) do |site_config|
        installed = site_config[:installed]
        installed||={}
        site_config[:installed] = installed
        array = installed[type.to_sym]
        if array.nil?
          array=[]
          installed[type.to_sym]=array
        end
        # don't re-add same one twice
        array.delete_if do |e|
          e[:name]==name and e[:type]==type and e[:version]==version
        end
        array << {:name=>name,:type=>type,:version=>version,:checksum=>checksum}
        @@installed_in_session << "#{type}_#{name}_#{version}"
      end
    end
    
    def Installer.install_from_devnetwork(type,description,from,quiet_if_installed=false,force=false,skip_dependencies=false)

      puts "Install from Dev Network: #{type},#{from} (force=#{force}) " if OPTIONS[:verbose]
      
      found = Installer.get_component_from_config type,from
      
      if not found
        die "Couldn't find #{type.to_s} #{from}"
      end
      
      count = 0

      # check to see if within this session (only) if we've already installed this and if so, don't attempt
      # to get it again
      installed = @@installed_in_session.include? "#{found[:type]}_#{found[:name]}_#{found[:version]}"

      if not skip_dependencies
        Installer.get_and_install_dependencies(found,quiet_if_installed) do |d,idx,total|
          dc = Installer.get_installed_component(d) unless OPTIONS[:force_update]
          if not dc
            t = total + (installed.nil? ? 1 : 0)
            dir,name,version,checksum=Installer.fetch_network_component d[:type],d,idx+1,t
            Installer.add_installed_component(name,d[:type],version,checksum,quiet_if_installed)
          end
          count+=1
        end
      end
      
      if found[:url].nil?
        fa = Installer.get_remote_component(found[:type],found[:name])
        if not fa or fa.empty?
          # this was installed locally and not remote
          return Installer.get_release_directory(found[:type],found[:name],found[:version]),found[:name],found[:version],nil,true
        end
        found = sort_components(fa)
      end

      fnc = Installer.get_installed_component(found) unless (force and not installed) or (OPTIONS[:force_update] and not installed) 
      return Installer.fetch_network_component(type,found,count+1,count+1) unless fnc
      
      puts "#{fnc[:type]} #{fnc[:name]}, #{fnc[:version]} already installed - skipping..." if OPTIONS[:verbose]
      return Installer.get_release_directory(fnc[:type],fnc[:name],fnc[:version]),fnc[:name],fnc[:version],fnc[:checksum],true
    end
    def Installer.get_remote_component(type,name,version=nil)
      found = []
      Installer.fetch_distribution_list
      with_site_config(false) do |site_config|
        distributions = site_config[:distributions]
        if distributions
          c = distributions[type] || distributions[type.to_sym]
          if c
            c.each do |cm|
              if cm[:name]==name and (cm[:type]==type.to_s or cm[:type]==type.to_sym) and ((!version.nil? and cm[:version]==version) or version.nil?)
                found << cm
              end
            end
          end
        end
      end
      found
    end
    
    def Installer.sort_components(found)
      if not found.empty?
        found.sort! do |a,b|
          Appcelerator::Project.to_version(a[:version]||0) <=> Appcelerator::Project.to_version(b[:version]||0)
        end
        return found.last
      end
      nil
    end
    
    def Installer.get_component_from_config(type,name,version=nil)
      found = get_remote_component(type,name,version)
      c = get_installed_component({:name=>name,:type=>type,:version=>version})
      
      found << c if c
      sort_components(found)
    end
    
    def Installer.get_installed_component(found)
      name = found[:name]
      type = found[:type]
      version = found[:version]
      with_site_config(false) do |site_config|
        installed = site_config[:installed]
        if installed
          c = installed[type.to_sym]
          if c
            items = []
            c.each do |cm|
              if cm[:name] == name and cm[:type]==type.to_s
                if version.nil?
                  items.push cm
                else
                  return cm
                end
              end
            end
            return sort_components(items)
          end
        end
      end
      nil
    end
    
    def Installer.same_file?(file1,file2)
      return false unless File.exists?(file2)
      checksum1 = checksum file1
      checksum2 = checksum file2
      checksum1 == checksum2
    end
    
    def Installer.checksum(file)
      f = File.open file,'rb'
      md5 = Digest::MD5.hexdigest f.read
      f.close
      md5
    end
    
    def Installer.get_project_config(dir)
      config = YAML::load_file "#{dir}/config/appcelerator.config" if File.exists? "#{dir}/config/appcelerator.config"
      config||={}
      config
    end
    
    def Installer.save_project_config(dir,config)
      puts "saving project config = #{dir}" if OPTIONS[:debug]
      
      out = "---\n"

      config.keys.sort {|a,b| a.to_s<=>b.to_s}.each do |k|
        out << ":#{k}: #{config[k].to_yaml[4..-1]}"
      end
      
      Installer.put "#{dir}/config/appcelerator.config", out, true
    end
    
    def Installer.with_project_config(dir,save=true)
      config = get_project_config dir
      yield config
      save_project_config dir,config if save
    end
    
    def Installer.check_appadmin_installed
      # config = {:name=>'appadmin',:type=>'appadmin'}
      # admin = Installer.get_installed_component config
      # if not admin
      #   puts "Completing installation ... "
      #   list = Installer.fetch_distribution_list
      #   if list
      #     a = list[:appadmin]
      #     admin = Installer.sort_components(a) if a
      #     if admin
      #       Installer.install_component('appadmin','Admin','appadmin',false,nil,true,false)
      #     end
      #   end
      # end
    end
    
  end
end


#
# bring these in since we can't depend on rails in this script
#

module NumericExtensions
    def bytes
      self
    end
    def kilobytes
      self * 1024
    end
    def megabytes
      self * 1024.kilobytes
    end
    def gigabytes
      self * 1024.megabytes
    end
    def terabytes
      self * 1024.gigabytes
    end
    alias :byte :bytes
    alias :kilobyte :kilobytes
    alias :megabyte :megabytes
    alias :gigabyte :gigabytes
    alias :terabyte :terabytes
end

class Fixnum
  include NumericExtensions
end

class Float
  include NumericExtensions
end

