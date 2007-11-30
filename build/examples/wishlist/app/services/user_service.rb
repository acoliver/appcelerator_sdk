
class UserService < Appcelerator::Service
  
  Service 'wl.signup.request', :signup, 'wl.signup.response'
  Service 'wl.login.request', :login, 'wl.login.response'
  Service 'wl.logout.request', :logout, 'wl.logout.response'
  
  def signup(request,message)
    if not message['email'] or not message['password']
      return {'scucess' => false, 'msg' => 'Email and password are required.'}
    end
    
    found = User.find_by_email(message['email'])
    if found
      return {'scucess' => false, 'msg' => 'Email address already exists.'}
    end
    
    user = User.new
    user.email = message['email']
    user.salt = [Array.new(6){rand(256).chr}.join].pack("m")[0..7]; 
    user.password = MD5.new(MD5.new(message['password'] + salt).hexdigest).hexdigest
    user.last_login = Time.now
    user.save!

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
  
end

