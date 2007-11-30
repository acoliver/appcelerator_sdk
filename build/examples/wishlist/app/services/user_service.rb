
class UserService < Appcelerator::Service
  
  Service 'wl.signup.request', :signup, 'wl.signup.response'
  Service 'wl.login.request', :login, 'wl.login.response'
  Service 'wl.logout.request', :logout, 'wl.logout.response'
  Service 'wl.profile.view.request', :viewprofile, 'wl.profile.view.response'
  Service 'wl.profile.edit.request', :editprofile, 'wl.profile.edit.response'
  
  def signup(request,message)
    if not message['email'] or not message['email'].strip or not message['password'] or not message['firstname'] or not message['firstname'].strip or not message['lastname'] or not message['lastname'].strip
      return {'scucess' => false, 'msg' => 'Required fields missing.'}
    end
    
    found = User.find_by_email(message['email'])
    if found
      return {'scucess' => false, 'msg' => 'Email address already exists.'}
    end
    
    user = User.new
    user.email = message['email'].strip
    user.salt = [Array.new(6){rand(256).chr}.join].pack("m")[0..7]; 
    user.password = MD5.new(MD5.new(message['password'] + salt).hexdigest).hexdigest
    user.last_login = Time.now
    user.save!
    
    profile = Profile.new
    profile.firstname = message['firstname'].strip
    profile.lastname = message['lastname'].strip
    profile.user = user
    profile.save!
    
    session = request['session']
    session[:user_id] = user.id
            
    return {'success' => true}
  end
  
  def login(request,message)
    if not message['email'] or not message['password']
      return {'success' => false}
    end
    
    user = User.find_by_email(message['login_email'])
    
    if (not user or user.password != MD5.new(MD5.new(message['password'] + user.salt).hexdigest).hexdigest)
      return {'success' => false}
    end
    
    session = request['session']
    session[:user_id] = user.id
    
    user.last_login = Time.now
    user.save!
  end

  def logout(request,message)
    session[:user_id] = nil
  end

  def viewprofile(request,message)
    session = request['session']
    if not session[:user_id]
      return {'success' => false}
    end
    
    user = User.find_by_id(session[:user_id])
    if not user
      return {'success' => false}
    end
    
    result = {}
    result['firstname'] = user.profile.firstname
    result['lastname'] = user.profile.lastname
    result['picture'] = user.profile.picture
    result['email'] = user.email
    result['success'] = true
    result
  end

  def editprofile(request,message)
    session = request['session']
    if not session[:user_id]
      return {'success' => false}
    end
    
    user = User.find_by_id(session[:user_id])
    if not user
      return {'success' => false}
    end
    
    if message['firstname'] and message['firstname'].strip
      user.profile.firstname = message['firstname'].strip
    end
    if message['lastname'] and message['lastname'].strip
      user.profile.lastname = message['lastname'].strip
    end
    if message['email'] and message['email'].strip
      found = User.find_by_email(message['email'].strip)
      if not found
        user.email = message['email'].strip
        user.save!
      elsif message['email'] != user.email
        return {'success' => false, 'msg' => 'Email address already exists.'}
      end
    end

    user.profile.save!
    return {'success' => true}
  end

end

