class User < ActiveRecord::Base
  has_one :profile
  has_many :friends
  has_many :items
  acts_as_ferret :store_class_name => true, :fields => [:email], :remote => true
  
  def has_friend? friend
    self.friends.contains friend
  end
  
  def add_friend friend 
    friend = Friend.new
    friend.user_id = self.id
    friend.friend_id = friend.id
    friend.save!
  end

end
