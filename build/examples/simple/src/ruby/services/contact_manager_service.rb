
class ContactManagerService < Appcelerator::Service
  
  Service 'example.createcontact.request', :create_contact, 'example.createcontact.response'
  
  def create_contact
      p "received message: #{params.inspect}"
      {"id"=>"1001","success"=>true}
  end
  
end