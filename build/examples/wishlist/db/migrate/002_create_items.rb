class CreateItems < ActiveRecord::Migration
  def self.up
    create_table :items do |t|
      t.column :user_id, :integer
      t.column :name, :string
      t.column :note, :string
      t.column :occasion, :string
      t.column :claimed, :boolean, :default => false
      t.column :claimed_date, :datetime
      t.column :claimed_user_id, :integer
      t.column :bought, :boolean, :default => false
      t.column :bought_date, :datetime
      t.column :created_at, :datetime
      t.column :updated_at, :datetime
    end
    add_foreign_key(:items, :user_id, :users)
    add_foreign_key(:items, :claimed_user_id, :users)
  end

  def self.down
    drop_table :items
  end
end
