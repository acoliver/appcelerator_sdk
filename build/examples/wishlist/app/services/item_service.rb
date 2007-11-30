
class ItemService < Appcelerator::Service
  
  Service 'wl.claim.item.request', :claimItem, 'wl.claim.item.response'
  Service 'wl.unclaim.item.request', :unclaimItem, 'wl.unclaim.item.response'
  Service 'wl.mark.purchased.item.request', :markItemPurchased, 'wl.mark.purchased.item.response'
  Service 'wl.add.item.request', :addItem, 'wl.add.item.response'
  Service 'wl.edit.item.request', :editItem, 'wl.edit.item.response'
  Service 'wl.remove.item.request', :removeItem, 'wl.remove.item.response'
  
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
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end

  def editItem(request,message)
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end

  def removeItem(request,message)
      p "received message: #{message.inspect}"
      msg = message["message"]
      {"message"=>"I received from you: #{msg}","success"=>true}
  end
end

