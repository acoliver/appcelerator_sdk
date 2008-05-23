
class ButtonTest < Test::Unit::SeleniumTestCase
  include SeleniumHelper
    @@widget = "button.html"
  
    def initialize(name="button test")
        return super(name)
    end
    
  	def test_clicking
        click("button_test_1")
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
  	end
	
  	def test_square 
        elem = "button_test_2"
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        assert(child_has_class(elem, "button_dark_square_left"))
        assert(child_has_class(elem, "button_dark_square_middle button_dark_text"))
        assert(child_has_class(elem, "button_dark_square_right"))
  	end
	
	def test_light_gray
        elem = "button_test_3"
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        assert(child_has_class(elem, "button_light_round_left"))
        assert(child_has_class(elem, "button_light_round_middle button_light_text"))
        assert(child_has_class(elem, "button_light_round_right"))
  	end
  	
  	def test_light_square 
        elem = "button_test_4"
        click(elem)
        alert_text = get_alert()
        assert_equal("test passed", alert_text)
        assert(child_has_class(elem, "button_light_square_left"))
        assert(child_has_class(elem, "button_light_square_middle button_light_text"))
        assert(child_has_class(elem, "button_light_square_right"))
  	end
  	
  	def test_enable_disable
        elem = "button_test_5"
        click(elem)
        begin
            alert_text = get_alert()
            assert(false, "An alert should not have been thrown")
        rescue SeleniumCommandError
            
          end
          
        mq('l:button.enable')
        click(elem)
        sleep 1
        assert_alert("test passed")
        
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
        click(elem)
        sleep 1
        alert_text = get_alert()
        assert_equal("test passed with value of input test value", alert_text)
  	end
  	
  	def test_icons
        assert(child_has_class("button_test_8", "button_icon_add_green"))
        assert(child_has_class("button_test_9", "button_icon_add_gray"))
        assert(child_has_class("button_test_10", "button_icon_delete_red"))
        assert(child_has_class("button_test_11", "button_icon_delete_gray"))
        assert(child_has_class("button_test_12", "button_icon_edit_yellow"))
        assert(child_has_class("button_test_13", "button_icon_edit_gray"))
        assert(child_has_class("button_test_14", "button_icon_save_blue"))
        assert(child_has_class("button_test_15", "button_icon_save_gray"))
  	end
  
    def page()
        return '/widget_tests/button.html'
    end


end