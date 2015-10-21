require 'test_helper'

class HighScoresControllerTest < ActionController::TestCase
  
  def setup
    @high_score = {name: "jag", score: 10}
  end

  test "should get show" do
    get :show
    assert_response :success
  end

  test "should get create" do
    get :create, high_score: @high_score
    assert_response :success
  end
end
