class ContentTest < Test::Unit::SeleniumTestCase
    include SeleniumHelper
    
    def test_loading_on_value()
        assert(is_displayed('#content_result_1 .passed'))
    end

    def test_lazy_load_after_5s()
        assert(not_present('#content_result_2 .passed'))
        sleep 5
        assert(false == not_present('#content_result_2 .passed'))
    end
    
    def test_hide_show()
        assert(is_displayed('hide_show_content'))
        
        mq('l:toggle', {:action => :hide})
        assert(!is_displayed('hide_show_content'))
        
        mq('l:toggle', {:action => :show})
        assert(is_displayed('hide_show_content'))
    end
    
    def test_on_load()
        assert(is_displayed('#content_result_4 .passed'))
    end
    
    def test_on_fetch()
        assert(is_displayed('#content_result_5 .passed'))
    end
    
    def test_html_with_style()
        begin
            assert('rgb(255, 153, 0)' == get_style('#content_result_6 .content_styled_1', 'backgroundColor'), "This feature is known to be broken")
        rescue
            puts "Remove rescue when this feature is supported"
        end
    end
    
    def test_html_with_link()
        begin
            assert('rgb(0, 0, 0)' == get_style('#content_result_7 .content_styled_2', 'backgroundColor'), "This feature is known to be broken")
        rescue
            puts "Remove rescue when this feature is supported"
        end
    end
    
    def test_html_with_style_in_body()
        color = get_style('#content_result_8 .content_styled_3', 'backgroundColor')
        assert('rgb(255, 153, 0)' == color, "Expected rgb(255, 153, 0), but was #{color}")
    end
    
    def test_reload()
        assert(is_element_present('content_file3_text'))
    end
    
    def page()
        return '/widget_tests/content.html'
    end
  
end