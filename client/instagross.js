var INSTAID = 'd2b56f48d91a40a1b21b6e741ad4e50c';
var ACCESSTOKEN = "";

//hack needed until 1.0 - at that point won't need the create/render hack, nor the #constant
Template.myMap.created = function() {
	Template.myMap.rendered = _.once(function() {
		var mapa = L.mapbox.map('map', 'robomex.he6o03jb'
			//,{detectRetina: true}
			);
		
		//Get geolocation
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(errorFunction);
		} else {
			alert('Use a browser that supports the Geolocation API');
		}

		//user did not enable geolcation, defaulted to Chicago
		function errorFunction() {
			getFailures();
		};

		var getFailures = function () {
			$.ajax({
				url: 'https://data.cityofchicago.org/resource/4ijn-s7e5.json?$select=aka_name,latitude,longitude&results=Fail&facility_type=restaurant&$order=inspection_date%20desc&$limit=3',
				datatype: 'json',
				success: matchToFB,
				statusCode: {
					500: function() {
						alert('Sorry, yo, service is temporarily down.');
					}
				}
			});
		};

		function matchToFB (json) {
			//if (json.meta.code == 200) {
				for (var i = 0; i < json.length; i++) {
					$.ajax({
						url: 'https://graph.facebook.com/search?q=' + json[i].aka_name + '&type=place&center=' + json[i].latitude + ',' + json[i].longitude + '&distance=100&access_token=253560938148674|tKIJElzYjmFRbNRdgG4DVyO8Iuk',
						dataType: 'json',
						success: fbPassthrough,
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

		function fbPassthrough (json) {
				var pass = json.data;
				getLocations(pass);
			//} else {
			//	alert("Instagram API limit exceeded - yo, please login to instagrimy with Instagram to see more shit");
			//};
		};

		//ajax call to Instagram API
		var getLocations = function (data) {
			for (var i = 0; i < data.length; i++) {
				$.ajax({
					url: 'https://api.instagram.com/v1/locations/search?callback=?',
					dataType: 'json',
					data: {facebook_places_id: data[i].id, client_id: INSTAID, access_token:ACCESSTOKEN},
					success: passInstaLocations,
					statusCode: {
						500: function() {
							alert('Sorry, yo, service is temporarily down.');
						}
					}
				});
			};
		};

		function passInstaLocations (json) {
				if (json.data.length != 0) {
					var locpass = json.data;
					getPhotos(locpass);
				};
			//} else {
			//	alert("Instagram API limit exceeded - yo, please login to instagrimy with Instagram to see more shit");
			//};
		};

		var getPhotos = function (data) {
			for (var i = 0; i < data.length; i++) {
				$.ajax({
					url: 'https://api.instagram.com/v1/locations/' + data[i].id + '/media/recent?callback=?',
					dataType: 'json',
					data: {client_id: INSTAID, access_token:ACCESSTOKEN},
					success: jsonLoad,
					statusCode: {
						500: function() {
							alert('Sorry, yo!!, service is temporarily down.');
						}
					}
				});
			};
		};

		//process json data if ajax call successful
		function jsonLoad (json) {
			if (json.meta.code == 200) {
				var show = json.data;
				placeInstaMarkers(show);
			} else {
				alert("Instagram API limit exceeded - yo, please login to instagrimy with Instagram to see more shit");
			};
		};

		//Instagram markers are placed for every photo, using the lat & lng info from the photo
		function placeInstaMarkers(data) {
			for (var i = 0; i < data.length; i++) {
				var latLng = L.latLng(data[i].location.latitude+.00003*i*Math.cos(i), data[i].location.longitude-.00003*i*Math.sin(i));
				var instaMarker = L.marker(latLng).addTo(mapa).bindPopup(popupContent).openPopup();
				var popupContent = '<div>'+ '<a href="http://instagram.com/'+ data[i].user.username +
					'" target="_blank">' + '<img class="profilePicture" src="'+ data[i].user.profile_picture +'"/>'
					+ '<span class="popupText user">'+ data[i].user.username + '</span>'+ '</a><br/>' + 
					'<span class="popupText location"><i class="fa fa-map-marker"></i> ' + data[i].location.name + '</span>' + 
					'<img class="popupPhoto" src="'+ data[i].images.standard_resolution.url 
					+'"/><br/>'+ '<span class="caption"><i class="fa fa-comment"></i> <span class="user">' + data[i].user.username + '</span> '
					+ data[i].caption.text + '</span></br><a href="' + data[i].link + '" target="_blank">' 
					+ '<span class="comment"><i class="fa fa-comment"></i> Comment</span></a></div>';
			};
		};		

	});
};





