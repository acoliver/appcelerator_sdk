
class FriendService < Appcelerator::Service
  
  Service 'wl.email_list.request', :email_list, 'wl.email_list.response'
  Service 'wl.friend.add.request', :add_friend, 'wl.friend.add.response'
  Service 'wl.friends.get.request', :get_friends, 'wl.friends.get.response'
  Service 'wl.friend.invite.request', :invite_friend, 'wl.friend.invite.response'
  

  def email_list(request,message)
    user_id = get_user_id(request)
    email_to = message['email_to']
    
    begin
      user = User.find(user_id)
      
      Mailer.deliver_list(user,email_to)
      {'success'=>true, 'message' => "Your list has been sent to #{email_to}"}
    rescue => e
      puts e
      {'message'=>'problem emailing your list','success'=>false}
    end
  end

  # add_friend nil {'friend_id': 44}
  #
  def add_friend(request,message)
      me = get_me(request)
      
      new_friend = User.find(message['friend_id'])
      
      if new_friend.nil?
        return {'success' => false, 'message' => 'Invalid friend id'}
      end
      
      if not me.has_friend? new_friend
        me.add_friend new_friend
        Mailer.deliver_friend(me,new_friend.email)
        return {'success' => true}
      else
        return {'success' => false, 'message' => 'That person is already your friend.'}
      end
  end

  def get_friends(request,message)
      begin
        user_id = message['user_id']
        if user_id.nil?
            user_id = get_user_id(request)
        end
        me = User.find(user_id)
        friendsInfo = me.friends.map do |friend|
          if friend.friend_id != me.id
            u = User.find(friend.friend_id)
            {'friend_id' => u.id,
             'name' => u.full_name,
             'picture' => u.profile.picture || 'images/small_picture.gif',
             'path' => "main.html?id=#{u.id}"}
          end
        end
        {'results' => friendsInfo.compact, 'success'=>true, 'length' => friendsInfo.nitems }    
      rescue
        {'success' => false, 'message' => 'Invalid User'}
      end
  end
  
  #  invite_friend nil {'friend_email': 'mkyfriend@blah.org'}
  #
  def invite_friend(request,message)
      me = get_me(request)
      friend_email = message['friend_email']
      existing = Invite.find_by_user_id_friend_email(me.id, friend_email)
      if existing:
          {'success' => false, 'message' => 'You have already invited that friend.'}
      else 
          {'success' => true}
      end
  end 

  def get_user_id(request)
    request['session'][:user_id]
  end
  
  def get_me(request)
      User.find(request['session'][:user_id])
  end
end
