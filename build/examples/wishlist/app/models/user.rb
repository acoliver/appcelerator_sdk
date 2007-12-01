class User < ActiveRecord::Base
  has_one :profile
  has_many :friends
  has_many :items
  acts_as_ferret :store_class_name => true, :fields => [:email], :remote => true
  
  def has_friend? friend
    found = false
    self.friends.each do |f|
      if not found and f.friend_id == friend.id
        found = true
      end
    end  
    found
  end
  
  def full_name
    self.profile.firstname + ' ' + self.profile.lastname
  end
  
  def add_friend friend 
    if not has_friend? friend
      f = Friend.new
      f.user_id = self.id
      f.friend_id = friend.id
      f.save!
      f
    end
    friend
  end

end
