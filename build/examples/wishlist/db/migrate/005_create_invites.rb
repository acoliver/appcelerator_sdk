class CreateInvites < ActiveRecord::Migration
  def self.up
    create_table :invites do |t|
      t.column :user_id, :integer
      t.column :friend_email, :string
      t.column :created_at, :datetime
      t.column :updated_at, :datetime
    end
    add_foreign_key(:invites, :user_id, :users)
  end

  def self.down
    drop_table :invites
  end
end
