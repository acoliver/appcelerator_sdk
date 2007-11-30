class UserProfileName < ActiveRecord::Migration
  def self.up
    add_column :profiles, :firstname, :string
    add_column :profiles, :lastname, :string
    remove_column :profiles, :full_name
  end

  def self.down
    add_column :profiles, :full_name, :string
    remove_column :profiles, :firstname
    remove_column :profiles, :lastname
  end
end
