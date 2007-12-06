require 'rbconfig'
require 'digest/md5'
require 'find'

################################################################################################
#
# Most of this comes straight from the Rails app generator - with the exception some files
# that aren't needed are removed and others related to appcelerator are added
#
################################################################################################


class AppceleratorGenerator < Rails::Generator::Base
  DEFAULT_SHEBANG = File.join(Config::CONFIG['bindir'],
                              Config::CONFIG['ruby_install_name'])
  
  DATABASES = %w( mysql oracle postgresql sqlite2 sqlite3 frontbase )
  
  default_options   :db => "mysql", :shebang => DEFAULT_SHEBANG, :freeze => false
  
  attr_accessor :secret_auth_key
  
  def initialize(runtime_args, runtime_options = {})
    super
    usage if args.empty?
    usage("Databases supported for preconfiguration are: #{DATABASES.join(", ")}") if (options[:db] && !DATABASES.include?(options[:db]))
    @destination_root = args.shift
    @railspath = runtime_options['railspath']
    @app_name = File.basename(File.expand_path(@destination_root)) 
    @secret_auth_key = Digest::MD5.hexdigest(Time.new.to_s + self.inspect + IPSocket.getaddress(Socket::gethostname).to_s)   
  end

  def manifest
    # Use /usr/bin/env if no special shebang was specified
    script_options     = { :chmod => 0755, :shebang => options[:shebang] == DEFAULT_SHEBANG ? nil : options[:shebang] }
    dispatcher_options = { :chmod => 0755, :shebang => options[:shebang] }

    record do |m|
    
      # Root directory and all subdirectories.
      m.directory ''
      BASEDIRS.each { |path| m.directory path }
      
      # Root
      m.file "#{@railspath}/fresh_rakefile", "Rakefile"
      m.file "templates/README",         "README"

      # Application
      m.template "templates/application.rb",                          "app/controllers/application.rb"
      m.template "templates/test_service.rb",                         "app/services/test_service.rb"
      m.template "#{@railspath}/helpers/application_helper.rb",       "app/helpers/application_helper.rb"
      m.template "#{@railspath}/helpers/test_helper.rb",              "test/test_helper.rb"
      m.template "templates/service_broker.rb",					  	          "app/controllers/service_broker_controller.rb"
      m.template "templates/service_broker_helper.rb",	              "app/helpers/service_broker_helper.rb"

      # database.yml and .htaccess
      m.template "#{@railspath}/configs/databases/#{options[:db]}.yml", "config/database.yml", :assigns => {
        :app_name => @appname,
        :socket   => options[:db] == "mysql" ? mysql_socket_location : nil
      }

      m.template "templates/routes.rb",     "config/routes.rb"
      m.template "#{@railspath}/configs/apache.conf",   "public/.htaccess"

      # Environments
      m.file "#{@railspath}/environments/boot.rb",            "config/boot.rb"

      m.template "templates/environment.rb", "config/environment.rb", :assigns => { :freeze => options[:freeze] }

      m.file "#{@railspath}/environments/production.rb",      "config/environments/production.rb"
      m.file "#{@railspath}/environments/development.rb",     "config/environments/development.rb"
      m.file "#{@railspath}/environments/test.rb",            "config/environments/test.rb"

      # Scripts
      %w( about breakpointer console destroy performance/benchmarker performance/profiler process/reaper process/spawner runner plugin ).each do |file|
        m.file "#{@railspath}/bin/#{file}", "script/#{file}", script_options
      end
 
      # Override special scripts
      %w( server generate ).each do |file|
        m.file "templates/#{file}",   "script/#{file}", script_options
      end
      
      # Dispatches
      m.file "#{@railspath}/dispatches/dispatch.rb",   "public/dispatch.rb", dispatcher_options
      m.file "#{@railspath}/dispatches/dispatch.rb",   "public/dispatch.cgi", dispatcher_options
      m.file "#{@railspath}/dispatches/dispatch.fcgi", "public/dispatch.fcgi", dispatcher_options
      
      mydir = File.dirname(__FILE__)
      
      %w(images javascripts).each do |dir|
        Dir.new(mydir + "/templates/#{dir}").each do |file|
          if file!="." and file!=".."
            m.file "templates/#{dir}/#{file}", "public/#{dir}/#{file}"
          end
        end
      end
      
      Find.find(mydir + "/templates/modules") do |path|
        p = Pathname.new(path)
        if FileTest.directory?(path)
          m.directory "public/modules/#{p.relative_path_from(Pathname.new(mydir + '/templates/modules'))}"
        else
          m.file "#{p.relative_path_from(Pathname.new(mydir))}", "public/modules/#{p.relative_path_from(Pathname.new(mydir + '/templates/modules'))}"
        end
      end

      # HTML files
      %w(index.html appcelerator.xml servicetester.html).each do |file|
        m.file "templates/#{file}", "public/#{file}"
      end
      
      m.template "#{@railspath}/html/favicon.ico",  "public/favicon.ico"
      m.template "#{@railspath}/html/robots.txt",   "public/robots.txt"

      # Docs
      m.file "#{@railspath}/doc/README_FOR_APP", "doc/README_FOR_APP"

      # Logs
      %w(server production development test).each { |file|
        m.file "#{@railspath}/configs/empty.log", "log/#{file}.log", :chmod => 0666
      }
    end
  end

  protected
    def banner
      "Usage: #{$0} /path/to/your/app [options]"
    end

    def add_options!(opt)
      opt.separator ''
      opt.separator 'Options:'
      opt.on("-r", "--ruby=path", String,
             "Path to the Ruby binary of your choice (otherwise scripts use env, dispatchers current path).",
             "Default: #{DEFAULT_SHEBANG}") { |v| options[:shebang] = v }

      opt.on("-d", "--database=name", String,
            "Preconfigure for selected database (options: mysql/oracle/postgresql/sqlite2/sqlite3).",
            "Default: mysql") { |v| options[:db] = v }

      opt.on("-f", "--freeze", 
            "Freeze Rails in vendor/rails from the gems generating the skeleton",
            "Default: false") { |v| options[:freeze] = v }
    end
    
    def mysql_socket_location
      RUBY_PLATFORM =~ /mswin32/ ? MYSQL_SOCKET_LOCATIONS.find { |f| File.exists?(f) } : nil
    end


  # Installation skeleton.  Intermediate directories are automatically
  # created so don't sweat their absence here.
  BASEDIRS = %w(
    app/controllers
    app/services
    app/helpers
    app/models
    config/environments
    components
    db
    doc
    lib
    lib/tasks
    log
    public/images
    public/javascripts
    public/stylesheets
    public/modules
    script/performance
    script/process
    test/fixtures
    test/functional
    test/integration
    test/mocks/development
    test/mocks/test
    test/unit
    vendor
    vendor/plugins
    tmp/sessions
    tmp/sockets
    tmp/cache
  )

  MYSQL_SOCKET_LOCATIONS = [
    "/tmp/mysql.sock",                        # default
    "/var/run/mysqld/mysqld.sock",            # debian/gentoo
    "/var/tmp/mysql.sock",                    # freebsd
    "/var/lib/mysql/mysql.sock",              # fedora
    "/opt/local/lib/mysql/mysql.sock",        # fedora
    "/opt/local/var/run/mysqld/mysqld.sock",  # mac + darwinports + mysql
    "/opt/local/var/run/mysql4/mysqld.sock",  # mac + darwinports + mysql4
    "/opt/local/var/run/mysql5/mysqld.sock"   # mac + darwinports + mysql5
  ]
end
