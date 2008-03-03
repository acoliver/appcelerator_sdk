module Appcelerator

    module Types
      
      class AnyType
        def is?(value)
          true
        end
      end
      
      class EnumerationType
        def initialize(types)
          @types = types
        end
        def to_s
          "Enumeration of: #{@types.join(' or ')}"
        end
        def is?(value)
          @types.include?(value)
        end
        def convert(value)
          value
        end
      end
      
      class DirectoryType
        def is?(value)
          File.directory?(value) and File.exists?(value)
        end
        def convert(value)
          return Dir.new(value) if File.exists?(value)
          if not OPTIONS[:quiet]
            confirm "Create directory [#{File.expand_path(value)}]? (Y)es,(N)o,(A)ll [Y]"
          end
          FileUtils.mkdir(value)
          Dir.new(value)
        end
      end
      
      class FileType
        def is?(value)
          File.file?(value) and File.exists?(value)
        end
        def convert(value)
          File.new(value)
        end
      end
      
      class NumberType
        def is?(value)
          idx = value =~ /[0-9]+/
          not idx.nil?
        end
        def convert(value)
          value.to_i
        end
      end
      
      class StringType
        def is?(value)
          idx = value =~ /[A-Za-z]+/
          not idx.nil?
        end
        def convert(value)
          value
        end
      end
      
      class AlphanumericType
        def is?(value)
          idx = value =~ /[0-9A-Za-z]+/
          not idx.nil?
        end
        def convert(value)
          value
        end
      end

      class BooleanType
        def is?(value)
          idx = value =~ /(true|false|1|0)/
          not idx.nil?
        end
        def convert(value)
          value == 'true' or value == '1'
        end
      end
      
    end
    
    class CommandRegistry
      @@registry=Hash.new
      
      def CommandRegistry.addOptions(opts=nil)
        if opts
          opts.each do |opt|
            HELP[opt[:name].to_sym] = opt
          end
        end
      end
      
      def CommandRegistry.registerCommand(name,help,args,opts,examples,&callback)
        case name.class.to_s
          when 'Array'
            name.each_with_index do |n,idx|
              @@registry[n] = {
                :args=>args,
                :opts=>opts,
                :examples=>examples,
                :invoker=>callback,
                :help=>help,
                :alias=>idx > 0
              } unless exists?(n)
              CommandRegistry.addOptions(opts)
            end
          when 'String'
            @@registry[name] = {
              :args=>args,
              :opts=>opts,
              :examples=>examples,
              :invoker=>callback,
              :help=>help,
              :alias=>false
            } unless exists?(name)
            CommandRegistry.addOptions(opts)
        end
      end
      
      def CommandRegistry.exists?(name)
        return false unless name
        not @@registry[name.strip].nil?
      end
      
      def CommandRegistry.find(name)
        return nil unless name
        @@registry[name.strip]
      end
      
      def CommandRegistry.each
        @@registry.sort {|a,b| a[0]<=>b[0]}.each do |k,v|
          yield k,v unless v[:alias]
        end
      end
      
      def CommandRegistry.execute(name,args=nil,opts=nil)

        info = @@registry[name]

        if not info
          if name=='help'
            return false
          else
            STDERR.puts " *ERROR: Unsupported command: #{name}" if name
            execute('help')
            return false
          end
        end
        
        required_args = info[:args]
        argHash = {}
        error = false
        
        if required_args
          required_args.each_with_index do |arg,index|
            next if error
            if arg[:required] and (not args or args.length < index+1)
              STDERR.puts " *ERROR: Required argument: #{arg[:name]} not found for command: #{name}"
              error = true
              next 
            end
            key = arg[:name].to_sym
            value = args.nil? ? nil : args[index]
            value=arg[:default] unless value
            type = arg[:type]
            typestr = type.to_s.split(':').last
            if type
              if arg[:required] 
                match = false
                case type.class.to_s
                  when 'String'
                    match = isType?(type,value)
                  when 'Class'
                    match = isType?(type,value)
                  when 'Array'
                    type.each do |t|
                      if isType?(t,value)
                        match = true
                        break
                      end
                    end
                else
                  match = type.is?(value)
                  typestr = type.to_s
                end
                if not match
                  die " *ERROR: Invalid argument value: #{value} for argument: #{key}. Must be of type: #{typestr}"
                end
                if arg[:conversion]
                  value = eval "#{arg[:conversion]}.new.convert('#{value}')"
                end
              end
            end
            argHash[key]=value
          end
        end
        
        if not error
          Appcelerator::Boot.boot unless name=='help' or name.index('help:')
          event = {:name=>name,:args=>argHash,:options=>opts}
          Appcelerator::PluginManager.dispatchEvent 'before_command',event
          info[:invoker].call(argHash,opts)
          Appcelerator::PluginManager.dispatchEvent 'after_command',event
        else
          execute('help',[name])
          false
        end
      end

      private 

      def CommandRegistry.isType?(type,value)
        expr = "#{type}.new.is?('#{value}')"
        result = eval expr
      end

    end
end
