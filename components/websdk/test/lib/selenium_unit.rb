require 'json'

class Selenium::SeleniumDriver
    def open(url)
        do_command("open", [url,])
        sleep 1
    end
end

class Test::Unit::SeleniumTestSuite < Test::Unit::TestSuite
    def initialize(name="Selenium Test", browser='firefox', basepath="http://appcelerator.org")
        super(name)
        @browser = browser
        @basepath = basepath
    end
    
    attr_writer :browser, :basepath
    
    def run(result, &progress_block)
      yield(STARTED, name)
      @tests.each do |test|
        test.browser = @browser
        test.basepath = @basepath
        test.run(result, &progress_block)
      end
      yield(FINISHED, name)
    end
end

class Test::Unit::SeleniumTestCase < Test::Unit::TestCase
    include SeleniumHelper
    
    attr_writer :browser, :basepath
    
    def initialize(name="Selenium Test Case")
        super(name)
    end
    
    def self.suite
      method_names = public_instance_methods(true)
      tests = method_names.delete_if {|method_name| method_name !~ /^test./}
      suite = Test::Unit::SeleniumTestSuite.new(name)
      tests.sort.each do
        |test|
        catch(:invalid_test) do
          suite << new(test)
        end
      end
      if (suite.empty?)
        catch(:invalid_test) do
          suite << new("default_test")
        end
      end
      return suite
    end
    
    def run(result)
      yield(STARTED, name)
      @_result = result
      begin
        setup
        __send__(@method_name)
      rescue Test::Unit::AssertionFailedError => e
        add_failure(e.message, e.backtrace)
      rescue Exception
        raise if PASSTHROUGH_EXCEPTIONS.include? $!.class
        add_error($!)
      ensure
        begin
          teardown
        rescue Test::Unit::AssertionFailedError => e
          add_failure(e.message, e.backtrace)
        rescue Exception
          raise if PASSTHROUGH_EXCEPTIONS.include? $!.class
          add_error($!)
        end
      end
      result.add_run
      yield(FINISHED, name)
    end
    
    def child_has_class(elem, class_name)
        text = get_eval("#{dollar(elem)}.select('[class=#{class_name}]')")
        return (text.length > 0)    
    end
    
    def mq(message_name)
        return get_eval("window.$MQ('#{message_name}')");
    end
    
    def dollar(elem_id)
        return "$(window.document.getElementById('#{elem_id}'))"
    end

    def get_messages()
        messages = get_eval("window.Appcelerator.Selenium.get_messages()")
        JSON.parse(messages)
    end
    
    def get_message(name)
        messages = get_messages()
        messages.each { |message| 
            name = name[1..name.length]
            if message['type'] == name
                return message
            end
        }
        return nil
    end
    
    def clear_messages()
        return get_eval("window.Appcelerator.Selenium.clear_messages()")
    end
    
    def add_message_listeners
        javascript = <<END_OF_JAVASCRIPT
        window.Appcelerator.Selenium = {
            messages: new window.Array(),
            clear_messages: function() {
               window.Appcelerator.Selenium.messages.clear(); 
            },
            get_messages: function() {
                return window.Object.toJSON(window.Appcelerator.Selenium.messages);
            }
        };

        window.$MQL('l:~.*',function(type,msg,datatype,from)
        {
            window.Appcelerator.Selenium.messages.push(
            {
               'type': type,
               'msg': msg,
               'datatype': datatype,
               'from': from 
            });
        });

        window.$MQL('r:~.*',function(type,msg,datatype,from)
        {
            window.Appcelerator.Selenium.messages.push(
            {
               'type': type,
               'msg': msg,
               'datatype': datatype,
               'from': from 
            });
        });
END_OF_JAVASCRIPT
        ret = get_eval(javascript)
    end
    
    def setup
        @selenium = Selenium::SeleniumDriver.new("localhost", 4444,
    		"*#{@browser}", "#{@basepath}/", 15000)
    	@selenium.start
    end
    
	def teardown
		@selenium.stop
	end
end