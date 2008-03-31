

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
        if not quiet_system('python -V')
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
        find_latest_script 'easy_install.exe'
      else
        'sudo easy_install'
      end
    end
    
    def paster
      if on_windows
        find_latest_script 'paster.exe'
      else
        'paster'
      end
    end
    
    def quiet_system(cmd)
      if OPTIONS[:verbose]
        puts cmd
      elsif not on_windows
        # is there a windows equivalent of this?
        cmd += ' > /dev/null 2>&1'
      end
      system(cmd)
    end
    
    # probably expensive, caching this
    def find_windows_pythons
      require 'win32/registry'
      paths = {}
      begin
        Win32::Registry::HKEY_LOCAL_MACHINE.open('SOFTWARE\Python\PythonCore') do |reg|
          reg.each_key do |key,wtime|
            begin
              paths[key] = reg.open(key).open('InstallPath').read('')[1]
            rescue
              nil
            end
          end
        end
      rescue
        paths
      end
      paths
    end

    def latest_windows_python
      @windows_pythons[-1][1]
    end

    def find_latest_script(script_name)
      @windows_pythons.each do |version,path|
        paster_path = File.join(path,'Scripts',script_name)
        if File.exists? paster_path
          return paster_path
        end
      end
      nil
    end
    
    def on_windows
      RUBY_PLATFORM =~ /(:?mswin|mingw)/
    end
  end
end