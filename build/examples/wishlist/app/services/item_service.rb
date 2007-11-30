
class ItemService < Appcelerator::Service
  
  Service 'wl.claim.item.request', :claimItem, 'wl.claim.item.response'
  Service 'wl.unclaim.item.request', :unclaimItem, 'wl.unclaim.item.response'
  Service 'wl.mark.purchased.item.request', :markItemPurchased, 'wl.mark.purchased.item.response'
  Service 'wl.add.item.request', :addItem, 'wl.add.item.response'
  Service 'wl.edit.item.request', :editItem, 'wl.edit.item.response'
  Service 'wl.remove.item.request', :removeItem, 'wl.remove.item.response'
  Service 'wl.list.item.request', :listItem, 'wl.list.item.response'
  
  def claimItem(request,message)
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end

  def unclaimItem(request,message)
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end
  
  def markItemPurchased(request,message)
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end

  def addItem(request,message)
      item_name = message['item_name']
      item_note = message['item_note']
      item_occasion = message['occasion']
      session = request['session']
      logged_in_user_id = request.session['user_id']
      
      if logged_in_user_id.nil?
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end

      item = Item.find_by_id(item_id)

      if item.user.id != logged_in_user_id
        return {'success' => false, 'message' => 'Oops! You cannot modify someone else\'s Wishalista'}       
      end
     
      item = Item.new
      item.name = item_name
      item.note = item_note
      item.occasion = item_occasion
      item.save!
      item.destroy
      {'success' => true, 'message' => 'We successfully removed the Wishalista item named ' + item.name}
  end

  def editItem(request,message)
      item_id = message['item_id']
      item_name = message['item_name']
      item_note = message['item_note']
      item_occasion = message['occasion']
      session = request['session']
      logged_in_user_id = request.session['user_id']
      
      if logged_in_user_id.nil?
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end

      item = Item.find_by_id(item_id)

      if item.user.id != logged_in_user_id
        return {'success' => false, 'message' => 'Oops! You cannot modify someone else\'s Wishalista'}       
      end
     
      if item
        item.name = item_name
        item.note = item_note
        item.occasion = item_occasion
        item.save!
        {'success' => true, 'message' => 'We successfully changed the Wishalista item named ' + item.name}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and change the specified Wishalista'}
      end
  end

  def removeItem(request,message)
      item_id = message['item_id']
      session = request['session']
      logged_in_user_id = request.session['user_id']
      
      if logged_in_user_id.nil?
        return {'success' => false, 'message' => 'Oops! You have to log in to view or modify a Wishalista'}
      end

      item = Item.find_by_id(item_id)

      if item.user.id != logged_in_user_id
        return {'success' => false, 'message' => 'Oops! You cannot modify someone else\'s Wishalista'}       
      end
     
      if item
        item.destroy
        {'success' => true, 'message' => 'We successfully removed the Wishalista item named ' + item.name}
      else
        {'success' => false, 'message' => 'Oops! We failed to find and remove the specified Wishalista'}
      end
  end
  
  def listItem(request,message)
      user_id = message['user_id']
      session = request['session']
      logged_in_user_id = request.session['user_id']
      
      if logged_in_user_id
        return {'success' => false, 'message' => 'You must log in to view or modify a Wishalista'}
      end      

      raw_items = Item.find(:all, :condition => ['user_id = ?', user_id], :order => 'created_at DESC')
      
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
        items.push(item)
      end

      is_me = logged_in_user_id == user_id ? true : false
      
      {'success' => true, 'isMe'=> is_me, 'items' => items}
  end
end

