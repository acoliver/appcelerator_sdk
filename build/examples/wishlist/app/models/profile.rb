class Profile < ActiveRecord::Base
  belongs_to :user
  acts_as_ferret :store_class_name => true, :fields => [:firstname, :lastname], :remote => true  
end
