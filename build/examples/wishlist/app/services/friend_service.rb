
class FriendService < Appcelerator::Service
  
  Service 'wl.emaillist.request', :emaillist, 'wl.emaillist.response'
  Service 'wl.viewuser.request', :viewuser, 'wl.viewuser.response'
  Service 'wl.add.friend.request', :addFriend, 'wl.add.friend.response'
  Service 'wl.get.friends.request', :getFriends, 'wl.get.friends.response'
  Service 'wl.invite.friend.request', :inviteFriend, 'wl.invite.friend.response'
  


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
   
  # addFriend nil {'friend_id': 44}
  #
  def addFriend(request,message)
      me = get_me(request)
      
      new_friend = Users.find(message['friend_id'])
      if not me.has_friend new_friend
        me.add_friend new_friend
        return {'status' => 'success'}
      else
        return {'status' => 'already friended'}
      end
  end

  # empty request
  def getFriends(request,message)
      me = get_me(request)
      friendsInfo = me.friends.map do |friend|
        {'friend_id' => friend.id,
         'name' => friend.full_name,
         'picture' => friend.picture}
      end
      {"friends" => friendsInfo,"success"=>true}    
  end
  
  #  inviteFriend nil {'friend_email': 'mkyfriend@blah.org'}
  #
  def inviteFriend(request,message)
      me = get_me(request)
      friend_email = message['friend_email']
      existing = Invites.find_by_user_id_friend_email(me.id, friend_email)
      if existing:
          {'status' => 'already invited'}
      else 
          {'status' => 'invited!!'}
      end
  end 

  def get_me(request)
      Users.find(request['session'][:user_id])
  end
end

end
  
end

