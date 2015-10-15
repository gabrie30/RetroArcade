Rails.application.routes.draw do
  root :to => "game#index"

  resource :high_scores
  resource :breakout_high_scores
end
