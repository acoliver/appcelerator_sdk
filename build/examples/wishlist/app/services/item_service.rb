
class ItemService < Appcelerator::Service
  
  Service 'wl.claim.item.request', :claim_item, 'wl.claim.item.response'
  Service 'wl.unclaim.item.request', :unclaim_item, 'wl.unclaim.item.response'
  Service 'wl.purchase.item.request', :purchase_item, 'wl.purchase.item.response'
  Service 'wl.unpurchase.item.request', :unpurchase_item, 'wl.unpurchase.item.response'
  Service 'wl.add.item.request', :add_item, 'wl.add.item.response'
  Service 'wl.edit.item.request', :edit_item, 'wl.edit.item.response'
  Service 'wl.remove.item.request', :remove_item, 'wl.remove.item.response'
  Service 'wl.list.item.request', :list_item, 'wl.list.item.response'
  
  def claim_item(request,message)
      item_id = message['item_id']
      session = request['session']
      logged_in_user_id = session[:user_id]
      
      if not logged_in?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      logged_in_user = User.find_by_id(logged_in_user_id)
      item = Item.find_by_id(item_id)

      if item
        item.claimed = true
        item.claimed_user = logged_in_user
        item.bought = false
        item.save!
        {'success' => true, 'message' => 'You have claimed this item'}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def unclaim_item(request,message)
      item_id = message['item_id']
      
      if not logged_in?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      item = Item.find_by_id(item_id)

      if item
        item.claimed = false
        item.claimed_user = nil
        item.bought = false
        item.save!
        {'success' => true, 'message' => 'Item has been unclaimed'}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end
  
  def purchase_item(request,message)
      item_id = message['item_id']
      
      if not logged_in?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      logged_in_user = User.find_by_id(logged_in_userid(request))
      item = Item.find_by_id(item_id)

      if item
        item.claimed = true
        item.claimed_user = logged_in_user
        item.bought = true
        item.save!
        {'success' => true, 'message' => 'Item has been marked as purchased'}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def unpurchase_item(request,message)
      item_id = message['item_id']
      
      if not logged_in?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      item = Item.find_by_id(item_id)

      if item
        item.claimed = false
        item.claimed_user = nil
        item.bought = false
        item.save!
        {'success' => true, 'message' => 'Item has been marked as unpurchased'}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def add_item(request,message)
      item_name = message['name']
      item_note = message['note']
      item_occasion = message['occasion']
      
      if not logged_in?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
     
      item = Item.new
      item.name = item_name
      item.note = item_note
      item.occasion = item_occasion
      item.user_id = logged_in_userid(request)
      item.save!
      {'success' => true, 'message' => 'Item has been added'}
  end

  def edit_item(request,message)
      item_id = message['item_id']
      item_name = message['name']
      item_note = message['note']
      item_occasion = message['occasion']
      session = request['session']

      if not logged_in?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end

      item = Item.find_by_id(item_id)

      if not current_user?(request,item.user.id)
        return {'success' => false, 'message' => 'Oops! You cannot modify someone else\'s Wishalista'}       
      end
     
      if item
        item.name = item_name
        item.note = item_note
        item.occasion = item_occasion
        item.save!
        {'success' => true, 'message' => 'Item has been updated'}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def remove_item(request,message)
      item_id = message['item_id']

      if not logged_in?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end

      item = Item.find_by_id(item_id)

      if not current_user?(request,item.user.id)
        return {'success' => false, 'message' => 'Oops! You cannot modify someone else\'s Wishalista'}       
      end
     
      if item
        item.destroy
        {'success' => true, 'item_id' => item.id, 'message' => 'Item has been removed'}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and remove the specified Wishalista'}
      end
  end
  
  def list_item(request,message)
      
      if not logged_in?(request)
        return {'success' => false, 'message' => 'You must log in to view or modify a Wishalista'}
      end      

      user_id = message_userid(message)
      my_user_id = logged_in_userid(request)
      
      if user_id.nil?
        user_id = my_user_id
      end
      
      user = User.find_by_id(user_id)
      
      if not user
        return {'success' => false, 'message' => 'Invalid user'}
      end

      raw_items = Item.find(:all, :conditions => ['user_id = ?', user_id], :order => 'created_at DESC')

      is_me = user_id.to_i === my_user_id.to_i
      me = user
      myfriend = false

      if not is_me
        me = User.find_by_id(my_user_id)
        myfriend = me.has_friend? user
      end
      
      items = Array.new 
      raw_items.each do |raw_item|
        item = {}
        item['item_id'] = raw_item.id        
        item['name'] = raw_item.name
        item['note'] = raw_item.note
        item['occasion'] = raw_item.occasion
        item['state'] = raw_item.bought ? 'purchased' : raw_item.claimed ? 'claimed' : myfriend ? 'available' : 'unavailable'
        item['claimed_name'] = raw_item.claimed_user.nil? ? '' : raw_item.claimed_user.full_name
        item['claimed_user_id'] = raw_item.claimed_user.nil? ? -1 : raw_item.claimed_user.id;
        item['isMe'] = is_me
        items.push(item)
      end

      result = {'success' => true, 'isMe'=> is_me, 'items' => items, 'length' => items.length, 'my_userid'=> my_user_id }
      result['firstname'] = user.profile.firstname
      result['lastname'] = user.profile.lastname
      result['picture'] = user.profile.picture
      result['name'] = user.profile.firstname

      if not is_me
        result['name'] = "#{user.profile.firstname} #{user.profile.lastname}"
        result['friended'] = myfriend
      end

      result['my_firstname'] = me.profile.firstname
      result['my_lastname'] = me.profile.lastname
      result['my_email'] = me.email
      result['my_userid'] = me.id
      result['user_id'] = user_id
      result['activated'] = me.activated

      result
  end
  
  def logged_in?(request)
      logged_in_user_id = logged_in_userid(request)
      !logged_in_user_id.nil? 
  end

  def current_user?(request, user_id)
      user_id == logged_in_userid(request)
  end
  
  def logged_in_userid(request)
      session = request['session']
      session[:user_id]
  end

  def message_userid(message)
      u = message['user_id']
      if not u.nil?
        if u == ''
          return nil
        end
      end
      u
  end

end

