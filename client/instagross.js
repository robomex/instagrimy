var INSTAID = 'd2b56f48d91a40a1b21b6e741ad4e50c';
var ACCESSTOKEN = "";

//hack needed until 1.0 - at that point won't need the create/render hack, nor the #constant
Template.myMap.created = function() {
	Template.myMap.rendered = _.once(function() {
		var mapa = L.mapbox.map('map', 'robomex.he6o03jb');
		
		//Instagram markers are placed for every photo, using the lat & lng info from the photo
		function placeInstaMarkers(data, map) {
			for (var i = 0; i < data.length; i++) {
				var latLng = L.latLng(data[i].location.latitude, data[i].location.longitude);
				var instaMarker = L.marker(latLng).addTo(mapa).bindPopup(popupContent).openPopup();
				var popupContent = '<img class="popupPhoto" src="'+ data[i].images.standard_resolution.url 
				+'"/><br/>'+ '<div class="userInfo">'+ '<a href="http://instagram.com/'+ data[i].user.username +
				'" target="_blank">' + '<img class="profilePicture" src="'+ data[i].user.profile_picture +'"/>'
				+ '<span class="popupText">@'+ data[i].user.username + '</span>'+ '</a>' +
				'<p class="caption">'+ data[i].caption + '</p>'+ '</div>';
			};
		};

		//process json data if ajax call successful
		function jsonLoad (json) {
			if (json.meta.code == 200) {
				var show = json.data;
				placeInstaMarkers(show, map);
			} else {
				alert("Instagram API limit exceeded - yo, please login to instagrimy with Instagram to see more shit");
			};
		};

		//Get geolocation
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(errorFunction);
		} else {
			alert('Use a browser that supports the Geolocation API');
		}

		//user did not enable geolcation, defaulted to Chicago
		function errorFunction(json) {
			var latLng = L.latLng(41.9, -87.7);
			getFailures();
		};



		function matchToFB (json) {
			//if (json.meta.code == 200) {
				for (var i = 0; i < json.length; i++) {
					$.ajax({
						url: 'https://graph.facebook.com/search?q=' + json[i].aka_name + '&type=place&center=' + json[i].latitude + ',' + json[i].longitude + '&distance=100&access_token=253560938148674|tKIJElzYjmFRbNRdgG4DVyO8Iuk',
						dataType: 'json',
						success: getPhotos,
						statusCode: {
							500: function() {
								alert('Sorry, yo, service is down.');
							}
						}
					});
				//};
			//} else {
			//	alert("Something's broke, yo.");
			};
		};


		var getFailures = function () {
			$.ajax({
				url: 'https://data.cityofchicago.org/resource/4ijn-s7e5.json?$select=aka_name,latitude,longitude&results=Fail&facility_type=restaurant&$order=inspection_date%20desc&$limit=10',
				datatype: 'json',
				success: matchToFB,
				statusCode: {
					500: function() {
						alert('Sorry, yo, service is temporarily down.');
					}
				}
			});
		};

		function returnMatched (fbJson) {
			//if (json.meta.code == 200) {
				return fbJson;
			//} else {
			//	alert("Instagram API limit exceeded - you need to sign in to instagrimy for this shit to work");
			//};
		};


		//ajax call to Instagram API
		var getPhotos = function (data) {
			$.ajax({
				url: 'https://api.instagram.com/v1/media/search?',
				dataType: 'jsonp',
				data: {'order': '-createdAt', facebook_places_id: data.id, client_id: INSTAID, access_token:ACCESSTOKEN},
				success: jsonLoad,
				statusCode: {
					500: function() {
						alert('Sorry, yo, service is temporarily down.');
					}
				}
			});
		};

	});
};





