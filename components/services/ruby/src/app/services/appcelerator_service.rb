class AppceleratorService < Appcelerator::Service

    def services
        listeners = Appcelerator::ServiceBroker.listeners
        all = listeners.inject([]) { |all_listeners, listener|
            listener[1].each { |s| 
                service = Object.const_get(s.service_name).instance
                
                before_filters = []
                service.before_filters.each {|filter|
                    if(service.execute_filter?(s.method_name,filter[:args]))
                        before_filters.push(filter[:filter])
                    end
                }
                
                after_filters = []
                service.after_filters.each {|filter|
                    if(service.execute_filter?(s.method_name,filter[:args]))
                        after_filters.push(filter[:filter])
                    end
                }
                
                all_listeners.push(
                {
                    :request => s.message_type,
                    :before_filter => before_filters.join(', '),
                    :response => s.response_type,
                    :class => s.service_name,
                    :after_filter => after_filters.join(', '),
                    :method => s.method_name
                })
            }
            all_listeners
        }
        {:success => true, :services => all}
    end
end
