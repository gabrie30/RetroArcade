class BreakoutHighScore < ActiveRecord::Base

  before_save :to_initials
  validates :name, presence: true
  validates :score, presence: true, numericality: true

  def to_initials
    initials = self.name.split("").take(3).join("").upcase
    
    if initials.length < 3
      while initials.length < 3
        initials += "_"
      end
    end

    self.name = initials
  end
end
