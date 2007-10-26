
class ContactManagerService < Appcelerator::Service
  
  Service 'example.createcontact.request', :create_contact, 'example.createcontact.response'
  
  def create_contact(request,message)
      p "received message: #{message.inspect}"
      {"id"=>"1001","success"=>true}
  end
  
end

