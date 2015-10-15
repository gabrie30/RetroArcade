class CreateBreakoutHighScores < ActiveRecord::Migration
  def change
    create_table :breakout_high_scores do |t|
      t.string :name
      t.integer :score

      t.timestamps null: false
    end
  end
end
