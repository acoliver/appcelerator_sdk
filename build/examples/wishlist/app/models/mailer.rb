class Mailer < ActionMailer::Base

  def invite(invite)
    @recipients     = invite.friend_email
    @from           = 'Appcelerator <support@appcelerator.com>'
    @subject        = invite.user.profile.full_name + ' invited you to use Wishlist'
    @sent_on        = Time.now
    @body['invite']  = invite
  end
  
  def list(user,email_to)
    @recipients     = email_to
    @from           = 'Appcelerator <support@appcelerator.com>'
    @subject        = "#{user.profile.firstname} #{user.profile.lastname} invited you to view their Wishlist "
    @sent_on        = Time.now
    body[:url]      = SITE_URL + "/main.html?id=#{user.id}"
    body[:name]     = user.profile.firstname + ' ' +user.profile.lastname
  end
end