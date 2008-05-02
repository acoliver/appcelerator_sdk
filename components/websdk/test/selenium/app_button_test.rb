
class ButtonTest < Test::Unit::SeleniumTestCase
  include SeleniumHelper
    @@widget = "button.html"
   
  
    def initialize(name="button test")
        return super(name)
    end
    
  	def test_clicking
  	    #url = "#{@basepath}/#{@@widget}"
        open(url())
        click("button_test_1")
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
  	end
	
  	def test_square 
        elem = "button_test_2"
        open(url())
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        assert(child_has_class(elem, "button_dark_square_left"))
        assert(child_has_class(elem, "button_dark_square_middle button_dark_text"))
        assert(child_has_class(elem, "button_dark_square_right"))
  	end
	
	def test_light_gray
        elem = "button_test_3"
        open(url())
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        assert(child_has_class(elem, "button_light_round_left"))
        assert(child_has_class(elem, "button_light_round_middle button_light_text"))
        assert(child_has_class(elem, "button_light_round_right"))
  	end
  	
  	def test_light_square 
        elem = "button_test_4"
        open(url())
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        assert(child_has_class(elem, "button_light_square_left"))
        assert(child_has_class(elem, "button_light_square_middle button_light_text"))
        assert(child_has_class(elem, "button_light_square_right"))
  	end
  	
  	def test_enable_disable
        elem = "button_test_5"
        open(url())
        click(elem)
        begin
            alert_text = get_alert()
            assert(false)
        rescue SeleniumCommandError
            
        end
        mq('l:button.enable')
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        
        mq('l:button.disable')
        click(elem)
        begin
            alert_text = get_alert()
            assert(false)
        rescue SeleniumCommandError
            
        end
  	end
  	
  	def test_activators
  	    elem = "button_test_6"
  	    open(url())
  	    
  	    begin
            alert_text = get_alert()
            assert(false)
        rescue SeleniumCommandError
            
        end
        
  	    type("firstname", "whatever")
        sleep 2
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)  	    
  	end
  	
  	def test_fieldset
  	    elem = "button_test_7"
        open(url())
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed with value of input test value", alert_text)
  	end
  	
  	def test_icons
        open(url())
        assert(child_has_class("button_test_8", "button_icon_add_green"))
        assert(child_has_class("button_test_9", "button_icon_add_gray"))
        assert(child_has_class("button_test_10", "button_icon_delete_red"))
        assert(child_has_class("button_test_11", "button_icon_delete_gray"))
        assert(child_has_class("button_test_12", "button_icon_edit_yellow"))
        assert(child_has_class("button_test_13", "button_icon_edit_gray"))
        assert(child_has_class("button_test_14", "button_icon_save_blue"))
        assert(child_has_class("button_test_15", "button_icon_save_gray"))
  	end
  
    def url()
        return "#{@basepath}/#{@@widget}"
    end

end