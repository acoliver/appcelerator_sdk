

module Appcelerator
  class PythonConfig
    
    def initialize
      if on_windows
        
        # list of two element lists, containing version number and path,
        # ordered from most recent to oldest
        @windows_pythons = find_windows_pythons.sort.reverse
        
        if @windows_pythons.empty?
          found_no_python
        end
        @python = File.join(latest_windows_python,'python.exe')
      else
        # on unixy things
        quiet_system('python -V')
        if $?.exitstatus == 127
          found_no_python
        end
        @python = 'python'
      end
    end

    def found_no_python
      STDERR.puts "I'm sorry, python was not found on your system. Please install it and re-try."
      exit 1
    end    

    attr_reader :python
        
    def easy_install
      if on_windows
        find_latest_script('easy_install.exe')
      else
        'sudo easy_install'
      end
    end
    
    def easy_install_installed?
      if on_windows
        find_latest_script('easy_install.exe') != nil
      else
        quiet_system('easy_install --help')
      end
    end
    
    def paster
      if on_windows
        find_latest_script('paster.exe')
      else
        'paster'
      end
    end
    
    def django_admin
        if on_windows
          find_latest_script('django_admin.py')
        else
          'django_admin.py'
        end
    end
    
    def quiet_system(cmd)
      if OPTIONS[:verbose]
        puts cmd
      else
        if on_windows
          cmd += ' 1>NUL 2>NUL'
        else
          cmd += ' > /dev/null 2>&1'
        end
      end
      if cmd =~ /^sudo / and OPTIONS[:subprocess]
        puts "__MAGIC__|ask|Please enter your password to install required python libraries|true|__MAGIC__"
      end
      system(cmd)
    end
    
    def PythonConfig.add_python_to_path
      config = PythonConfig.new
      if config.on_windows
        # python doesn't seem to put itself on the path on windows
        ENV['PATH'] += ';'+File.dirname(config.python)
      end
    end
    
    # probably expensive, caching this
    def find_windows_pythons
      require 'win32/registry'
      
      global = find_version_in_registry(Win32::Registry::HKEY_LOCAL_MACHINE)
      user = find_version_in_registry(Win32::Registry::HKEY_CURRENT_USER)
      
      global.merge(user)
    end
    
    def find_version_in_registry(registry_hive)
      paths = {}
      begin
        registry_hive.open('SOFTWARE\Python\PythonCore') do |reg|
          reg.each_key do |key,wtime|
            begin
              paths[key] = reg.open(key).open('InstallPath').read('')[1]
            rescue
              nil
            end
          end
        end
      rescue
      end
      paths
    end

    def latest_windows_python
      @windows_pythons[-1][1]
    end

    def find_latest_script(script_name)
      @windows_pythons.each do |version,path|
        script_file_path = File.join(path,'Scripts',script_name)
        if File.exists?(script_file_path)
          return script_file_path
        end
      end
      return nil # couldn't find it
    end
    
    def on_windows
      RUBY_PLATFORM =~ /(mswin|mingw|windows|win32)/
    end
    
    
    #
    # Refactored out from the original Pylons install script,
    # for use by the Django install script
    #
    
    def install_easy_install_if_needed(installer)
      if not easy_install_installed?
        installer.confirm("Appcelerator:Python requires easy_install to be installed before continuing. Install? [Yn]")
        
        require 'open-uri'
        require 'tempfile'
        ez_setup_src = open('http://peak.telecommunity.com/dist/ez_setup.py').read
        ez_file = Tempfile.new('ez_setup.py')
        ez_file.write(ez_setup_src)
        ez_file.close
        
        if on_windows
          quiet_system("#{python} #{ez_file.path}")
        else
          puts "__MAGIC__|ask|Please enter your password to install the python easy_install tool|true|__MAGIC__" if OPTIONS[:subprocess]
          quiet_system("sudo #{python} #{ez_file.path}")
        end
      end
    end
    
    def install_appcelerator_egg_if_needed(dir,version)
      appc_version_check = "#{python} -c \"from pkg_resources import require;require('Appcelerator==#{version}')\""
      if not quiet_system(appc_version_check)
        puts "Installing new Appcelerator module" unless OPTIONS[:quiet]
        quiet_system("#{easy_install} \"#{dir}/module/\"")
        # attempt to avoid this http://groups.google.com/group/pylons-devel/browse_thread/thread/2c740abef6eb4b9e
        quiet_system("#{easy_install} -U simplejson")
      end
    end
    
  end
end
