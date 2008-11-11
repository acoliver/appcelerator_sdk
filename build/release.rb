require 'rubygems'
require 'json'
require 'zip/zip'
require 'digest/md5'
require 'aws/s3'
require 'yaml'
require 'open-uri'

DISTRO_BUCKET = 'distro.appcelerator.org'

class Release
    attr_accessor :local
    attr_accessor :type
    attr_accessor :name
    attr_accessor :url
    attr_accessor :version
    attr_accessor :checksum
    attr_accessor :filesize
    attr_accessor :dependencies
    attr_accessor :subtype

    def initialize(o = {})
        @local = o[:local] unless not o[:local]
        @type = o[:type] unless not o[:type]
        @type = o[:subtype] unless not o[:subtype]
        @name = o[:name] unless not o[:name]
        @version = o[:version] unless not o[:version]
        @checksum = o[:checksum] unless not o[:checksum]
        @filesize = o[:filesize] unless not o[:filesize]
        @url = o[:url] unless not o[:url]
        @dependencies = o[:dependencies] unless not o[:dependencies]
    end

    def Release.from_hash(h, type)
         Release.new({
            :local => false,
            :type => type,
            :subtype => h['subtype'],
            :name => h['name'],
            :version => h['version'],
            :checksum => h['checksum'],
            :filesize => h['filesize'],
            :url => h['url'],
            :dependencies => h['dependencies'] || []
        })
    end

    def Release.from_zip(zipfile)
        r = Release.new({
            :local => true,
            :checksum => Digest::MD5.file(zipfile),
            :url => File.expand_path(zipfile),
            :filesize => File.size(zipfile)
        })

        c = r.load_buildyml()
        r.type = c[:type]
        r.subtype = c[:control]
        r.name = c[:name]
        r.version = c[:version]
        r.dependencies = c[:dependencies] || []
        return r
    end

    def load_buildyml()
        if not @local
            return nil
        end

        c = nil
        Zip::ZipFile.open(@url, Zip::ZipFile::CREATE) do |zip|
            config_text = zip.read('build.yml') rescue nil

            if config_text.nil?
              raise "Could not read build.yml in #{@url}"
            end

            c = YAML::load(config_text) rescue nil

        end
        
        if c.nil?
          raise "Could not parse build.yml in #{@url}"
        end

        c
    end

    def update_buildyml()
        if not @local
            return
        end

        c = load_buildyml()
        c[:type] = @type if @type
        c[:name] = @name if @name
        c[:version] = @version if @version
        c[:dependencies] = @dependencies if @dependencies

        Zip::ZipFile.open(@url, Zip::ZipFile::CREATE) do |zip|
            zip.get_output_stream("build.yml") {|f| f.puts(YAML::dump(c)) }
        end

        @filesize = File.size(@url)
    end

    def to_hash()
        h = {}
        h['type'] = @type
        h['name'] = @name
        h['version'] = @version
        h['checksum'] = @checksum
        h['filesize'] = @filesize
        h['url'] = @url
        h['dependencies'] = @dependencies

        h
    end

    def <=>(other)
        if other.class != self.class
            return 0
        end

        if other.type != @type
            return @type <=> other.type
        end

        if other.subtype != @subtype and \
            not other.subtype.nil? and not @subtype.nil?
            return @type <=> other.type
        end

        if other.name != @name
            return @name <=> other.name
        end

        @version.to_s.split('.').map {|n| n.to_i} <=> other.version.to_s.split('.').map {|n| n.to_i}
    end

    def ==(other)
        return (other.class == self.class \
            and other.subtype == @subtype \
            and other.type == @type \
            and other.version == @version \
            and other.name == @name)
    end

    def to_s()
        out = "#{@type} -> #{@name} -> #{@version}"
        if (@local)
            out += ' [local]'
        end
        out
    end

end

class Manifest
    attr_accessor :model
    attr_accessor :config

    def initialize(text, config)
        @config = config
        @model = JSON.parse(text)

        @model.each_pair { |ctype, creleases|
            @model[ctype] = creleases.collect {|hash|
                Release.from_hash(hash, ctype)
            }
        }
    end

    def serialize()
        h = {}

        @model.each_pair { | ctype, creleases |

            # fake dependency resolution
            # this should eventually be replaced
            creleases.each { |rel|
                to_remove = []
                rel.dependencies.each { |dep|
                   dep_rel = get_latest_release(dep['type'], dep['name'])

                   if dep_rel
                    dep['version'] = dep_rel.version.to_s
                    dep['filesize'] = dep_rel.filesize
                    dep['checksum'] = dep_rel.checksum
                    dep['url'] = dep_rel.url
                   else
                    to_remove << dep
                   end
                }
                rel.dependencies = rel.dependencies - to_remove
            }

            h[ctype] = creleases.collect {|release| release.to_hash() }

        }
        h.to_json()
    end

    def Manifest.from_server(config)

    end


    def get_releases(o = {})
        type = o[:type]
        name = o[:name]
        version = o[:version]

        if type.class == Array
            subtype = type[1]
            type = type[0]
        else
            subtype = nil
        end

        releases = []
        @model.each_pair { |ctype, creleases|
            if not type or ctype == type
                releases += creleases
            end
        }

        if subtype
            releases.reject! {|x| x.subtype.to_s != subtype.to_s}
        end

        if name
            releases.reject! {|x| x.name.to_s != name.to_s}
        end

        if version
            releases.reject! {|x| x.version.to_s != version.to_s}
        end

        releases
    end

    def add_release(rel)

        if not @model.has_key?(rel.type)
            @model[rel.type] = []
        end

        # remove releases with same type, name, version
        @model[rel.type].reject! {|r| r == rel}

        @model[rel.type] << rel
    end

    def get_latest_release(type, name)
        releases = get_releases(:type => type, :name => name)

        if releases.length < 1
            return nil
        end

        latest = releases[0]
        releases.each { |other|
            if (other <=> latest) > 0
                latest = other
            end
        }

        latest
    end

    def get_next_version_for(type, name)
        prev_rel = get_latest_release(type, name)

        if prev_rel
            parts = prev_rel.version.split('.')
            parts = parts[0..-2] + [parts.last + 1]
            return parts.join('.')
        else
            return @config[:version] + '.0'
        end
    end

    def get_current_version(type, name)
        latest = get_latest_release(type, name)
        if latest
            return latest.version
        else
            return get_next_version_for(type, name)
        end
    end

    def release_zipfile(zipfile)
        new_rel = Release.from_zipfile(zipfile)
        
        if not new_rel.version # get the next applicable version
            new_ver = get_next_version_for(new_rel.type, new_rel.name)
            puts "No version defined so bumping [#{prev_rel.version} -> #{new_ver}]"
            new_rel.version = new_rel
            new_rel.update_buildyml()

        end
    end
end

class FileTransport
    attr_accessor :dir
    attr_accessor :manifest
    attr_accessor :release_dir
    attr_accessor :manifest_file

    def initialize(dir, config)

        release_name = config[:name].to_s
        release_version = config[:version].to_s
    
        @release_dir = File.join(dir, release_name + '-' + release_version)
        @manifest_file = File.join(@release_dir, "manifest.js")

        if not(File.exists?(@release_dir))
            FileUtils.mkdir_p(@release_dir)
        end

        if not(File.exists?(@manifest_file))
            man = "{}"
        else
            f = File.new(@manifest_file, 'r')
            man = f.read()
            f.close
        end

        if not man or man == ""
            man = "{}"
        end

        @manifest = Manifest.new(man, config)

    end

    def add_release(rel)
        @manifest.add_release(rel)
    end

    def push
        @manifest.get_releases.each { | release |
            if release.local
                out_dir = File.join(@release_dir, release.type)
                out_file = File.join(out_dir, "#{release.name}-#{release.version}.zip")
                FileUtils.mkdir_p(out_dir)
                FileUtils.cp(release.url, out_file)

                release.url = File.expand_path(out_file)
            end
        }

        f = File.open(@manifest_file, 'w')
        f.puts(@manifest.serialize())
        f.close
    end

end

class S3Transport
    attr_accessor :bucket_name
    attr_accessor :bucket
    attr_accessor :manifest
    attr_accessor :release_path
    attr_accessor :manifest_path


    def initialize(bucket_name, config)

        release_name = config[:name].to_s
        release_version = config[:version].to_s

        @release_path = File.join(release_name + '-' + release_version)
        @manifest_path = File.join(@release_path, "manifest.js")

        @aws_access_key_id = ENV['AWS_ACCESS_KEY_ID']
        @aws_secret_access_key = ENV['AWS_SECRET_ACCESS_KEY']

        # try to load the secret keys from a config file
        s3_conf_file = File.join(get_home(), '.s3conf', 's3config.yml')
        if File.exists?(s3_conf_file) and (@aws_access_key_id.nil? or @aws_secret_access_key.nil?)
            s3_config = YAML::load_file(s3_conf_file)
            @aws_access_key_id = s3_config['AWS_ACCESS_KEY_ID']
            @aws_secret_access_key = s3_config['AWS_SECRET_ACCESS_KEY']
        end

        if @aws_access_key_id.nil?
          puts "Read-only mode: AWS_ACCESS_KEY_ID not in ENV or in #{s3_conf_file}"

        elsif @aws_secret_access_key.nil?
          puts "Read-only mode: AWS_SECRET_ACCESS_KEY_ID not in ENV or in #{s3_conf_file}"
        else
          AWS::S3::Base.establish_connection!(
              :access_key_id => @aws_access_key_id,
              :secret_access_key => @aws_secret_access_key
          )
        end

        @bucket_name = bucket_name
        @url_prefix = "http://#{@bucket_name}"

        man_text = fetch(@manifest_path, true) 

        # failed to connect to S3 -- try to load it via
        # HTTP from distro site, otherwise start with a
        # blank manifest
        if not man_text
            man_text = load_manifest_via_web() || '{}'
        end

        @manifest = Manifest.new(man_text, config)

    end

    def load_manifest_via_web()
        begin   
           open("http://s3.amazonaws.com/#{DISTRO_BUCKET}/#{@manifest_path}").read()
        rescue
            nil
        end
    end

    def get_home
      home = ENV['HOME'] || ENV['USERPROFILE']
      if (not home) and ENV['HOMEDRIVE'] and ENV['HOMEPATH']
        home = "#{ENV['HOMEDRIVE']}:#{ENV['HOMEPATH']}"
      elsif (not home)
          begin
            home = File.expand_path('~')
          rescue
            home = '.'
          end
      end
      return File.expand_path(home)
    end

    def fetch(path, can_fail = false)
        begin
            entry = AWS::S3::S3Object.find(path, @bucket_name)

            data = entry.value
            #if (entry.content_encoding == 'gzip')
            #	data = Zlib::GzipReader.new(StringIO.open(data)).read()
            #end

            return data
        rescue
            if not can_fail
               throw "Could not find '#{path}' in bucket (#{bucket})"
            end
        end
    end

    def put(path, content, content_type)
        AWS::S3::S3Object.store(
            path, 
            content, 
            @bucket_name,   
            :content_type => content_type,
            :access => :public_read
        )
    end

    def add_release(rel)
        @manifest.add_release(rel)
    end

    def push
        @manifest.get_releases.each { | release |
            if release.local
                out_path = File.join(@release_path,
                                      release.type,
                                      "#{release.name}-#{release.version}.zip")
                put(out_path, File.open(release.url), "application/zip")

                release.url = "#{@url_prefix}/#{out_path}"
            end
        }

        put(@manifest_path, @manifest.serialize(), "text/javascript")
    end

end


# example of how to use the different transports
#config_text = File.open('config.yml').read()
#config = YAML::load(config_text)
#t = S3Transport.new(DISTRO_BUCKET, config)
#t = FileTransport.new("dist", config)

# how to release a zip file
#Dir["appcelerator2/*.zip"].each {|file|
#    puts "Releasing #{file}..."
#    r = Release.from_zip(file)
#    t.add_release(r)
#}
#puts "pushing releases..."
#t.push()
