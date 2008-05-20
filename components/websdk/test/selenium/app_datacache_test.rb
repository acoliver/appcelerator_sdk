class DataCacheTest < Test::Unit::SeleniumTestCase
    include SeleniumHelper
    
    
    def test_no_reload()
        mq('l:datacache1.request')
        assert("1" == get_text('datacache1'))
    end
    
    def test_reload()
       assert("1" == get_text('datacache2'))
       sleep 6
       mq('l:datacache2.request')
       sleep 1
       assert("2" == get_text('datacache2')) 
    end
    
    def test_auto_reload()
        assert("1" == get_text('datacache3'))
        sleep 11
        assert("2" == get_text('datacache3'))
    end
    
    def test_auto_reload_long_interval()
        assert("1" == get_text('datacache4'))
        sleep 31
        assert("2" == get_text('datacache4'))
    end
    
    def test_with_arguments()
        assert("0" == get_text('datacache5args'))
        assert("0" == get_text('datacache5noargs'))
        
        mq('l:datacache5.request', {:args => true})
        sleep 1
        assert("1" == get_text('datacache5args'))
        assert("0" == get_text('datacache5noargs'))
        
        mq('l:datacache5.request', {:args => false})
        sleep 1
        assert("1" == get_text('datacache5args'))
        assert("-1" == get_text('datacache5noargs'))
        
        sleep 5
        
        mq('l:datacache5.request', {:args => true})
        mq('l:datacache5.request', {:args => false})
        assert("2" == get_text('datacache5args'))
        assert("-2" == get_text('datacache5noargs'))
    end
    
    def page()
        return '/widget_tests/datacache.html'
    end
    
end