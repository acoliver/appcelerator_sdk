#
# require dependencies
#
Dir[File.dirname(__FILE__)+'/messagebroker/*.rb'].sort.each do |file|
	require file[0..-4]
end


#
# set the default message broker to the basic in memory message broker
#
Appcelerator::MessageBroker = Appcelerator::InmemoryMessageBroker.instance