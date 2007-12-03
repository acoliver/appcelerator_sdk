class Activation < ActiveRecord::Migration
  def self.up
    add_column :users, :activation, :string
    add_column :users, :activated, :boolean, :default => false
    add_column :users, :activated_on, :datetime
    add_index :users, :activation
  end

  def self.down
    remove_index :users, :activation
    remove_column :users, :activation
    remove_column :users, :activated
    remove_column :users, :activated_on
  end
end
