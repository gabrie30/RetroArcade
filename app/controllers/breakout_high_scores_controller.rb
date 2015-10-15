class BreakoutHighScoresController < ApplicationController

def show
  @scores = BreakoutHighScore.order("score DESC").limit(5)
  render :json => @scores
end

def create
  @score = BreakoutHighScore.new(score_params)
  if @score.save
    render :json => @score
  end
end

private

  def score_params
    params.require(:high_score).permit(:name, :score)
  end
end
