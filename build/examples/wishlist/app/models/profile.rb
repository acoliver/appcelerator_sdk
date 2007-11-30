class Profile < ActiveRecord::Base
  belongs_to :user
  acts_as_ferret :store_class_name => true, :fields => [:profile], :remote => true  
end
