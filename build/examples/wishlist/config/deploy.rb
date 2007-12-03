require 'mongrel_cluster/recipes'

set :application, "wishalista"
set :repository,  "https://svn.appcelerator.org/appcelerator_sdk/trunk/build/examples/wishlist"

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :deploy_to, "/appcelerator/web/www.wishalista.com"

set :runner, nil
set :database, "mysql"

# If you aren't using Subversion to manage your source code, specify
# your SCM below:
# set :scm, :subversion

role :app, "www.wishalista.com"
role :web, "www.wishalista.com"
role :db,  "www.wishalista.com", :primary => true

set :user, "build"

set :environment, ENV['RAILS_ENV'] || 'production'
set :use_sudo, false
set :runner, nil
set :mongrel_conf, "config/mongrel_cluster.yml"


desc "After updating code we need to populate a new database.yml"
task :after_update_code, :roles => :app do
  require "yaml"
  set :database_username , proc { Capistrano::CLI.password_prompt("database username : ") }
  set :database_password, proc { Capistrano::CLI.password_prompt("database password : ") }

  buffer = YAML::load_file("config/database.yml")

  %w(production staging).each do |name| 
    # Populate production element
    buffer[name] = {}
    buffer[name]['adapter'] = "mysql"
    buffer[name]['database'] = "#{application}" + (environment=='production' ? '' : env)
    buffer[name]['username'] = database_username 
    buffer[name]['password'] = database_password
    buffer[name]['host'] = "localhost"
    buffer[name]['socket'] = "/var/lib/mysql/mysql.sock"
  end

  put YAML::dump(buffer), "#{release_path}/config/database.yml", :mode => 0664

  run "rm -rf #{release_path}/tmp"
  run "ln -nfs #{deploy_to}/shared/tmp #{release_path}/tmp"
  run "ln -nfs #{deploy_to}/shared/profiles #{release_path}/public/images/profiles"
end


desc "Show process list"
task :ps do
  run "ps -efw"
end


desc "The spinner task is used by :cold_deploy to start the application up"
task :spinner, :roles => :app do
end

desc "Restart Apache"
task :restart_apache do
  sudo "/usr/sbin/apachectl restart"
end


namespace :deploy do
 
   task :start, :roles => :app do
     run "cd #{current_path} && RAILS_ENV=#{environment} ./script/ferret_start"
     run "cd #{current_path} && mongrel_rails cluster::start -C #{mongrel_conf}"
     restart_apache
   end
 
   task :restart, :roles => :app do
     begin
	run "cd #{current_path} && RAILS_ENV=#{environment} ./script/ferret_stop"
     rescue
     end
     run "cd #{current_path} && RAILS_ENV=#{environment} ./script/ferret_start"
     run "cd #{current_path} && mongrel_rails cluster::restart -C #{mongrel_conf}"
     restart_apache
   end
 
end
