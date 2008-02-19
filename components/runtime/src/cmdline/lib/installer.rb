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
      puts "Checking update server ..." unless OPTIONS[:silent] or silent or OPTIONS[:quiet]
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
              elsif url =~ /\.zip$/ or f.content_type =~ /^application\/zip/
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
    
    def Installer.load_site_config
      return @@site_config if @@site_config
      @@site_config_file = "#{RELEASE_DIR}/config.yml"
      @@site_config = YAML::load_file @@site_config_file if File.exists?(@@site_config_file)
      @@site_config||={}
      @@site_config
    end
    
    def Installer.save_site_config
      if @@site_config
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
    
    def Installer.fetch_distribution_list
        return @@distributions if @@distributions
        login_if_required
        client = get_client
        puts "Fetching release info from distribution server..." unless OPTIONS[:quiet]
        response = client.send('distribution.query.request')
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
        members = site_config[:distributions][component[:type].to_sym]
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

    def Installer.fetch_network_component(type,from,component,count=1,total=1)
      to_dir = Installer.get_component_directory(component)
      Installer.fetch_component(type,from,component[:version],to_dir,component[:name],component[:url],count,total)
      return to_dir,component[:name],component[:version],component[:checksum]
    end

    def Installer.fetch_network_url(type,from,config,url)
      to_dir = Installer.get_release_directory(config[:type],config[:name],config[:version])
      Installer.fetch_component(type,from,config[:version],to_dir,config[:name],url,1,1)
    end

    def Installer.fetch_component(type,from,version,to_dir,name,url,idx,total)
      puts "fetching into: #{to_dir} => #{url}" if OPTIONS[:debug]
      FileUtils.mkdir_p to_dir unless File.exists? to_dir
      Appcelerator::PluginManager.dispatchEvent 'before_
      ',type,from,name,version,to_dir
      Installer.http_fetch_into("(#{idx}/#{total}) #{name}",url,to_dir)
      Appcelerator::PluginManager.dispatchEvent 'after_install_component',type,from,name,version,to_dir
    end
    
    def Installer.install_from_zipfile(type,description,from)
      config = Installer.get_build_from_zip from
      if not config
        STDERR.puts "Invalid package file #{from}. Missing build.yml"
        exit 1
      end
      to_dir = Installer.get_release_directory(config[:type],config[:name],config[:version])
      Appcelerator::PluginManager.dispatchEvent 'before_install_component',type,from,config[:name],config[:version],to_dir
      Installer.unzip to_dir,from
      Appcelerator::PluginManager.dispatchEvent 'after_install_component',type,from,config[:name],config[:version],to_dir
      return to_dir,config[:name],config[:version]
    end

    def Installer.install_component(type,description,from,quiet_if_installed=false)

        to_dir = nil
        name = nil
        version = nil
        checksum = nil
        already_installed = false
       
        case from
          when /^http:\/\//
            #FIXME
            STDERR.puts "not yet supported"
            exit 1
          when /\.zip$/
            to_dir,name,version = Installer.install_from_zipfile(type,description,from)
            checksum = Installer.checksum(from)
        else
          to_dir,name,version,checksum,already_installed = Installer.install_from_devnetwork(type,description,from,quiet_if_installed)
        end
        
        if not already_installed
          puts "Fetched into #{to_dir}" if OPTIONS[:debug]

          # run pre_flight if it exists
          pre_flight = File.join(to_dir,'pre_flight.rb')
          if File.exists?(pre_flight)
            puts "Found pre-flight file at #{pre_flight}" if OPTIONS[:verbose]
            require pre_flight 
          end

          Installer.add_installed_component(name,type,version,checksum)
        end
        
        puts unless already_installed
        puts "Installed #{description}: #{name},#{version}" unless (OPTIONS[:quiet] or already_installed)
        puts "NOTE: you can force a re-install with --force-update" if already_installed and OPTIONS[:verbose]
        
        return to_dir,name,version,checksum,already_installed
    end
    
    def Installer.add_installed_component(name,type,version,checksum,save=true)
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
      end
    end
    
    def Installer.install_from_devnetwork(type,description,from,quiet_if_installed=false)
      list = Installer.fetch_distribution_list
      components = list[type.to_sym]

      found = nil
      if components
        components.each do |component|
          if component[:name] == from
            found = component
            break
          end
        end
      end
      
      if not found
        STDERR.puts "Couldn't find #{type} #{from}"
        exit 1
      end
      
      count = 0
      Installer.get_and_install_dependencies(found,quiet_if_installed) do |d,idx,total|
        dc = Installer.get_installed_component(d) unless OPTIONS[:force_update]
        if not dc
          dir,name,version,checksum=Installer.fetch_network_component d[:type],from,d,idx+1,total+1
          Installer.add_installed_component(name,d[:type],version,checksum,quiet_if_installed)
        end
        count+=1
      end

      fnc = Installer.get_installed_component(found) unless OPTIONS[:force_update]
      return Installer.fetch_network_component(type,from,found,count+1,count+1) unless fnc
      
      puts "#{fnc[:type]} #{fnc[:name]}, #{fnc[:version]} already installed - skipping..." if OPTIONS[:verbose]
      return Installer.get_release_directory(fnc[:type],fnc[:name],fnc[:version]),fnc[:name],fnc[:version],fnc[:checksum],true
    end
    
    def Installer.get_component_from_config(type,name,version=nil)
      with_site_config(false) do |site_config|
        distributions = site_config[:distributions]
        if distributions
          c = distributions[type.to_sym]
          if c
            c.each do |cm|
              return cm if cm[:name]==name and cm[:type]==type and ((!version.nil? and cm[:version]==version) or version.nil?)
            end
          end
        end
      end
      nil
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
            c.each do |cm|
              return cm if cm[:name] == name and cm[:type]==type and cm[:version]==version
            end
          end
        end
      end
      nil
    end
    
    def Installer.checksum(file)
      f = File.open file,'rb'
      md5 = Digest::MD5.hexdigest f.read
      f.close
      md5
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

