
class FriendService < Appcelerator::Service
  
  Service 'wl.emaillist.request', :emaillist, 'wl.emaillist.response'
  Service 'wl.viewuser.request', :viewuser, 'wl.viewuser.response'
  
  def emaillist(request,message)
    user_id = message["user_id"]
    email_to = message["email_to"]
    
    begin
      user = User.find(user)
      
      {"success"=>true}
    rescue 
      {"message"=>"problem doing that #{$!}","success"=>false}
    end
  end
  def viewuser(request,message)
      user_id = message["user_id"]
      begin
        user = User.find(user_id)
        {"user"=>user, "profile"=> user.profile,"success"=>true}
      rescue 
        {"message"=>"problem looking up user #{$!}","success"=>false}
      end
  end
  
end

