class User < ActiveRecord::Base
  has_one :profile
  has_many :friends
  has_many :items
  acts_as_ferret :store_class_name => true, :fields => [:email], :remote => true  
end
