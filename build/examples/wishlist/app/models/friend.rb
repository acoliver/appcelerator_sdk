class Friend < ActiveRecord::Base
  belongs_to :user
  
  def full_name
    self.user.full_name
  end
  
  def profile
    self.user.profile
  end
end
