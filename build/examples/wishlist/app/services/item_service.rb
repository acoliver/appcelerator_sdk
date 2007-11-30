
class ItemService < Appcelerator::Service
  
  Service 'wl.claim.item.request', :claimItem, 'wl.claim.item.response'
  Service 'wl.unclaim.item.request', :unclaimItem, 'wl.unclaim.item.response'
  Service 'wl.purchase.item.request', :purchaseItem, 'wl.purchase.item.response'
  Service 'wl.unpurchase.item.request', :unpurchaseItem, 'wl.unpurchase.item.response'
  Service 'wl.add.item.request', :addItem, 'wl.add.item.response'
  Service 'wl.edit.item.request', :editItem, 'wl.edit.item.response'
  Service 'wl.remove.item.request', :removeItem, 'wl.remove.item.response'
  Service 'wl.list.item.request', :listItem, 'wl.list.item.response'
  
  def claimItem(request,message)
      item_id = message['item_id']
      session = request['session']
      logged_in_user_id = session[:user_id]
      
      if loggedIn?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      logged_in_user = User.find_by_id(logged_in_user_id)
      item = Item.find_by_id(item_id)

      if item
        item.claimed = true
        item.claimed_user = logged_in_user
        item.bought = false
        item.save!
        {'success' => true}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def unclaimItem(request,message)
      item_id = message['item_id']
      
      if loggedIn?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      item = Item.find_by_id(item_id)

      if item
        item.claimed = false
        item.claimed_user = nil
        item.bought = false
        item.save!
        {'success' => true}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end
  
  def purchaseItem(request,message)
      item_id = message['item_id']
      
      if loggedIn?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      logged_in_user = User.find_by_id(loggedInUserId(request))
      item = Item.find_by_id(item_id)

      if item
        item.claimed = true
        item.claimed_user = logged_in_user
        item.bought = true
        item.save!
        {'success' => true}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def unpurchaseItem(request,message)
      item_id = message['item_id']
      
      if loggedIn?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
      
      item = Item.find_by_id(item_id)

      if item
        item.claimed = false
        item.claimed_user = nil
        item.bought = false
        item.save!
        {'success' => true}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def addItem(request,message)
      item_name = message['name']
      item_note = message['note']
      item_occasion = message['occasion']
      
      if loggedIn?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end
     
      item = Item.new
      item.name = item_name
      item.note = item_note
      item.occasion = item_occasion
      item.user_id = loggedInUserId(request)
      item.save!
      {'success' => true}
  end

  def editItem(request,message)
      item_id = message['item_id']
      item_name = message['name']
      item_note = message['note']
      item_occasion = message['occasion']
      session = request['session']

      if loggedIn?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end

      item = Item.find_by_id(item_id)

      if !isCurrentUser?(request,item.user.id)
        return {'success' => false, 'message' => 'Oops! You cannot modify someone else\'s Wishalista'}       
      end
     
      if item
        item.name = item_name
        item.note = item_note
        item.occasion = item_occasion
        item.save!
        {'success' => true}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def removeItem(request,message)
      item_id = message['item_id']

      if loggedIn?(request)
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end

      item = Item.find_by_id(item_id)

      if !isCurrentUser?(request,item.user.id)
        return {'success' => false, 'message' => 'Oops! You cannot modify someone else\'s Wishalista'}       
      end
     
      if item
        item.destroy
        {'success' => true, 'item_id' => item.id}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and remove the specified Wishalista'}
      end
  end
  
  def listItem(request,message)
      user_id = messageUserId(message)
      
      if loggedIn?(request)
        return {'success' => false, 'message' => 'You must log in to view or modify a Wishalista'}
      end      

      raw_items = Item.find(:all, :conditions => ['user_id = ?', user_id], :order => 'created_at DESC')

      is_me = isCurrentUser?(request, user_id)
      
      items = Array.new 
      raw_items.each do |raw_item|
        item = {}
        item['item_id'] = raw_item.id        
        item['name'] = raw_item.name
        item['note'] = raw_item.note
        item['occasion'] = raw_item.occasion
        item['claimed'] = raw_item.claimed        
        item['claimed_name'] = raw_item.claimed_user.nil? ? '' : raw_item.claimed_user.name
        item['claimed'] = raw_item.claimed        
        item['bought'] = raw_item.bought        
        item['isMe'] = is_me
        items.push(item)
      end
      
      {'success' => true, 'isMe'=> is_me, 'items' => items}
  end
  
  def loggedIn?(request)
      logged_in_user_id = loggedInUserId(request)

      if !logged_in_user_id.nil?
        return false
      else
        return true
      end  
  end

  def isCurrentUser?(request, user_id)
      if user_id != loggedInUserId(request)
        return false
      else
        return true
      end
  end
  
  def loggedInUserId(request)
      session = request['session']
      return session[:user_id]
  end

  def messageUserId(message)
      return message['user_id']
  end

end

