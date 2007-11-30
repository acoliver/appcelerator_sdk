class Item < ActiveRecord::Base
  belongs_to :user
  belongs_to :claimed_user, :class_name => 'User', :foreign_key => 'claimed_user_id'  
  acts_as_ferret :store_class_name => true, :fields => [:name], :remote => true  
end
