
class ItemService < Appcelerator::Service
  
  Service 'claim.item.request', :claimItem, 'claim.item.response'
  Service 'unclaim.item.request', :unclaimItem, 'unclaim.item.response'
  Service 'mark.purchased.item.request', :markItemPurchased, 'mark.purchased.item.response'
  Service 'add.item.request', :addItem, 'add.item.response'
  Service 'edit.item.request', :editItem, 'edit.item.response'
  Service 'remove.item.request', :removeItem, 'remove.item.response'
  
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

