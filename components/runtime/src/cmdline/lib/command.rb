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
    
    class CommandGroup
      attr_reader :name, :order
      def initialize(name,order)
        @name = name
        @order = order
      end
      def registerCommand(name,help,args=nil,opts=nil,examples=nil,&callback)
        CommandRegistry.registerCommand(name,help,args,opts,examples,self,&callback)
      end
    end
    
    class CommandRegistry
      @@registry=Hash.new
      @@groups=Hash.new
      
      def CommandRegistry.addOptions(opts=nil)
        if opts
          opts.each do |opt|
            HELP[opt[:name].to_sym] = opt
          end
        end
      end
      
      def CommandRegistry.makeGroup(name,order=nil)
        name = name.to_sym
        if @@groups[name]
          group = @@groups[name]
        else
          order = 1000 if order == nil
          group = CommandGroup.new(name,order)
          @@groups[name] = group
        end
        yield group if block_given?
        group
      end
      
      def CommandRegistry.inferGroup(group, commandName)
        # group can be a group, a name of a group, or nil (in which case a new group is created)
        if not group.is_a? CommandGroup
          group = @@groups[group.to_sym] if not group.nil?
          if not group
            groupName = commandName.split(':')[0].to_sym
            group = @@groups[groupName]
            if not group
              group = CommandRegistry.makeGroup(groupName)
            end
          end
        end
        group
      end
      
      def CommandRegistry.registerCommand(name,help,args=nil,opts=nil,examples=nil,group=nil,&callback)
        if name.is_a? Array
          names = name
        elsif name.is_a? String
          names = [name]
        end
        
        names.each_with_index do |name,idx|
          @@registry[name] = {
            :args=>args || [],
            :opts=>opts || [],
            :examples=>examples || [],
            :invoker=>callback,
            :help=>help,
            :group=>CommandRegistry.inferGroup(group, name),
            :alias=>idx > 0
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
        @@registry.sort_by { |name,command|
          [command[:group].order, command[:group].name.to_s, name]
        }.each do |k,v|
          yield k,v unless v[:alias]
        end
      end
      
      def CommandRegistry.execute(name,args=[],opts=nil)

        command_info = @@registry[name]

        if not command_info
          if name != 'help'
            STDERR.puts " *ERROR: Unsupported command: #{name}" if name
            execute('help')
          end
          return false
        end
        
        begin
          argHash = extractArgs(args, command_info[:args])
          opts = extractOptionalArgs(opts, command_info[:opts])
        
          Boot.boot unless name=='help' or name.index('help:')
          event = {:name=>name,:args=>argHash,:options=>opts}
          PluginManager.dispatchEvents('command',event) do
            command_info[:invoker].call(argHash,opts)
          end
        
        rescue UserError
          # may fail due to missing args or type problems
          execute('help',[name])
          false
        end
      end
      
      class UserError < StandardError
      end

      private 
      
      def CommandRegistry.extractArgs(given_args, required_args)
        result_args = {}
        required_args.each_with_index do |argdef,index|
          if argdef[:required] and given_args.length < index+1
            STDERR.puts " *ERROR: Required argument: #{argdef[:name]} not found"
            raise UserError.new
          end

          value = given_args[index] || argdef[:default]          
          value = typeCheckAndConvert(value, argdef)
          
          key = argdef[:name].to_sym          
          result_args[key] = value
        end
        result_args
      end
      
      def CommandRegistry.extractOptionalArgs(given_opts, optional_args)
        result_opts = given_opts || {}
        optional_args.each do |optdef|
          key = optdef[:name].to_sym
          
          value = given_opts[key] || optdef[:default]
          value = typeCheckAndConvert(value, optdef)
          
          result_opts[key] = value
        end
        result_opts
      end
      
      
      def CommandRegistry.typeCheckAndConvert(value, argdef)
        type = argdef[:type]
        if type and argdef[:required]
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
          end
          
          if not match
            typestr = type.to_s.split(':').last
            STDERR.puts " *ERROR: Invalid argument value: #{value} for argument: #{argdef[:name]}. Must be of type: #{typestr}"
            raise UserError.new
          end
          
          if argdef[:conversion]
            value = argdef[:conversion].new.convert(value)
          end
        end
        return value
      end
      
      def CommandRegistry.isType?(type,value)
        type.new.is?(value)
      end

      # command groups (can be extended by plugins)
      CommandRegistry.makeGroup(:add,       0)
      CommandRegistry.makeGroup(:create,    1)
      CommandRegistry.makeGroup(:help,      2)
      CommandRegistry.makeGroup(:install,   3)
      CommandRegistry.makeGroup(:list,      4)
      CommandRegistry.makeGroup(:network,   5)
      CommandRegistry.makeGroup(:project,   6)
      CommandRegistry.makeGroup(:other,     7)
    end
    
end
