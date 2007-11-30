class User < ActiveRecord::Base
  has_one :user_profile
  has_many :friends
  has_many :items
end
