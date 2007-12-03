require 'ftools'
require 'RMagick'

class UserService < Appcelerator::Service
  
  Service 'wl.signup.request', :signup, 'wl.signup.response'
  Service 'wl.login.request', :login, 'wl.login.response'
  Service 'wl.logout.request', :logout, 'wl.logout.response'
  Service 'wl.activate.request', :activate, 'wl.activate.response'
  Service 'wl.profile.view.request', :view_profile, 'wl.profile.view.response'
  Service 'wl.profile.edit.request', :edit_profile, 'wl.profile.edit.response'
  Service 'wl.profile.picture.upload.request', :upload_picture, 'wl.profile.picture.upload.response'
  Service 'wl.profile.picture.crop.request', :crop_picture, 'wl.profile.picture.crop.response'
  
  def signup(request,message)
    if not message['email'] or not message['email'].strip or not message['password'] or not message['firstname'] or not message['firstname'].strip or not message['lastname'] or not message['lastname'].strip
      return {'success' => false, 'message' => 'Required fields missing.'}
    end
    
    found = User.find_by_email(message['email'])
    if found
      return {'success' => false, 'message' => 'Email address already exists.'}
    end
    
    user = User.new
    user.email = message['email'].strip
    user.salt = [Array.new(6){rand(256).chr}.join].pack("m")[0..7]; 
    user.password = MD5.new(MD5.new(message['password'] + user.salt).hexdigest).hexdigest
    user.last_login = Time.now
    user.activation = MD5.new(user.email + user.salt).hexdigest
    user.activated = false
    user.save!
    
    profile = Profile.new
    profile.firstname = message['firstname'].strip
    profile.lastname = message['lastname'].strip
    profile.user = user
    profile.save!
    
    session = request['session']
    session[:user_id] = user.id
    
    Mailer.deliver_activation(user)
            
    {'success' => true, 'message' => 'Signup complete'}
  end
  
  def activate(request,message)
    code = message['code']
    if !code
      return {'success'=>false,'message'=>'Invalid activation code'}
    end
    user = User.find_by_activation(code)
    if !user
      return {'success'=>false,'message'=>'Invalid activation code'}
    end
    user.activated = true
    user.activated_on = Time.now
    user.save!
    {'success'=>true,'user_id'=>user.id}
  end
  
  def login(request,message)
    if not message['email'] or not message['password']
      return {'success' => false, 'message' => 'invalid login'}
    end
    
    user = User.find_by_email(message['email'])
    
    if (not user or user.password != MD5.new(MD5.new(message['password'] + user.salt).hexdigest).hexdigest)
      return {'success' => false, 'message' => 'invalid login'}
    end
    
    session = request['session']
    session[:user_id] = user.id
    
    user.last_login = Time.now
    user.save!
    {'success' => true}
  end

  def logout(request,message)
    session = request['session']
    if session
      session[:user_id] = nil
    end
    {'result'=>true}
  end

  def view_profile(request,message)
    session = request['session']
    if not session[:user_id]
      return {'success' => false, 'message' => 'not logged in'}
    end
    
    user = User.find_by_id(session[:user_id])
    if not user
      return {'success' => false, 'message' => 'invalid user'}
    end
    
    result = {}
    result['firstname'] = user.profile.firstname
    result['lastname'] = user.profile.lastname
    result['picture'] = user.profile.picture
    result['email'] = user.email
    result['success'] = true
    result
  end
  
  def upload_picture(request,message)
    tmpfile = message['filename']

    # get the public folder
    FileUtils.mkdir_p("#{FileUtils.pwd}/public/uploads")
    newfile = File.new("#{FileUtils.pwd}/public/uploads/#{File.basename(tmpfile.path)}", 'wb')

    # place in preview
    File.copy tmpfile.path, newfile.path
    
    # delete temp uploaded file
    File.delete tmpfile.path

    {'success'=>true, 'path'=>"uploads/#{File.basename(newfile.path)}"}
  end
  
  def crop_picture(request,message)
    session = request['session']
    if not session[:user_id]
      return {'success' => false, 'message' => 'not logged in'}
    end
    
    user = User.find_by_id(session[:user_id])
    if not user
      return {'success' => false, 'message' => 'Invalid User'}
    end

    path = message['path']
    x = message['x1'].to_i
    y = message['y1'].to_i
    w = message['width'].to_i
    h = message['height'].to_i

    # change the path and hash the userid as the name of the profile image
    # so it's not too easy to guess it
    FileUtils.mkdir_p("#{FileUtils.pwd}/public/images/profiles")
    name = "images/profiles/#{MD5.new(user.id.to_s).hexdigest}.png"
    
    # crop picture and save the cropped version
    picture = Magick::ImageList.new("#{FileUtils.pwd}/public/#{path}")
    picture.crop!(x,y,w,h)
    picture.write "#{FileUtils.pwd}/public/#{name}"
    
    user.profile.picture = name
    user.profile.save!
    
    {'success'=>true, 'path'=> user.profile.picture}
  end

  def edit_profile(request,message)
    session = request['session']
    if not session[:user_id]
      return {'success' => false, 'message' => 'not logged in'}
    end
    
    user = User.find_by_id(session[:user_id])
    if not user
      return {'success' => false, 'message' => 'invalid user'}
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
        return {'success' => false, 'message' => 'Email address already exists.'}
      end
    end

    user.password = MD5.new(MD5.new(message['password'] + user.salt).hexdigest).hexdigest
    user.profile.save!
    {'success' => true, 'message' => 'Your profile has been updated'}
  end

end

