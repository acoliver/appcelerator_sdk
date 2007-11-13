#
# require dependencies
#
Dir[File.dirname(__FILE__)+'/servicebroker/*.rb'].sort.each do |file|
	require file[0..-4]
end


#
# set the default service broker to the basic in memory service broker
#
Appcelerator::ServiceBroker = Appcelerator::InmemoryServiceBroker.instance