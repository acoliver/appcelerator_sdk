class CreateProfiles < ActiveRecord::Migration
  def self.up
    create_table :profiles do |t|
        t.column :user_id, :integer
        t.column :full_name, :string
        t.column :picture, :string
        t.column :created_at, :datetime
        t.column :updated_at, :datetime
    end
  end

  def self.down
    drop_table :profiles
  end
end
