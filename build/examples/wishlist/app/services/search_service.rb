
class SearchService < Appcelerator::Service
  
  Service 'wl.search.request', :search, 'wl.search.response'

  def search(request,message)
    session = request['session']
    if not session[:user_id]
      return {'success' => false, 'message' => 'You must be logged in'}
    end
    
    query = message['query']
    search_results = Array.new
    if query
      results = User.multi_search(query.strip, [Profile, Item])
      results.each do |result|
        if result.class == User
          picture = result.profile.picture || 'images/small_picture.gif'
          search_results.push({'type' => 'user', 'email' => result.email, 'firstname' => result.profile.firstname, 'lastname' => result.profile.lastname, 'path' => "main.html?id=#{result.user.id}", 'picture'=> picture})
        elsif result.class == Profile
          picture = result.user.profile.picture || 'images/small_picture.gif'
          search_results.push({'type' => 'profile', 'email' => result.user.email, 'firstname' => result.firstname, 'lastname' => result.lastname, 'path' => "main.html?id=#{result.id}", 'picture'=> picture})
        elsif result.class == Item
          picture = result.user.profile.picture || 'images/small_picture.gif'
          search_results.push({'type' => 'item', 'email' => result.user.email, 'firstname' => result.user.profile.firstname, 'lastname' =>  result.user.profile.lastname, 'name' => result.name, 'occassion' => result.occasion, 'note' => result.note, 'path' => "main.html?id=#{result.user.id}"}, 'picture' => picture)
        end
      end
    end
    return {'success' => true, 'results' => search_results, 'length' => search_results.size}
  end

end

