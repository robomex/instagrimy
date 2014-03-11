Meteor.methods({
	getAccessToken: function(){
		try{
			return Meteor.user().profile.token;
		} catch (e){
			throw(e);
		}
	}
});