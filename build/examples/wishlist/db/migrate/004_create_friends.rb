class CreateFriends < ActiveRecord::Migration
  def self.up
    create_table :friends do |t|
      t.column :user_id, :integer
      t.column :friend_id, :integer
      t.column :created_at, :datetime
      t.column :updated_at, :datetime
    end
    add_foreign_key(:friends, :user_id, :users)
    add_foreign_key(:friends, :friend_id, :users)
  end

  def self.down
    drop_table :friends
  end
end
