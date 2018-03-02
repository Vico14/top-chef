var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();






app.get('/scrape', function(req, res){
	// The URL we will scrape from - in our example Anchorman 2.

	url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
	url2 = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-'
	var i=0; 
	
	// The structure of our request call
	// The first parameter is our URL
	// The callback function takes 3 parameters, an error, response status code and the html

	request(url, function(error, response, html){

		// First we'll check to make sure no errors occurred when making the request

		if(!error){
			var $ = cheerio.load(html);

			var title, stars, nbOffres, typeCuisine, price;
			var json = { title : "", stars : "", nbOffres : "", typeCuisine : "", price : ""};

			$('poi-card-link').each(function(){

				$('.poi_card-display-title').filter(function(){


					 var data = $(this);

					 title = data.text();

					 json.title = title;})



				 $('.mtpb2c-offers').filter(function(){


					 var data = $(this);

					 nbOffres = data.text();

					 json.title = nbOffres;})


				 $('.poi_card-display-cuisines is-truncated').filter(function(){


					 var data = $(this);

					 typeCuisine = data.text();

					 json.title = typeCuisine;})


				 $('.poi_card-display-price').filter(function(){


					 var data = $(this);

					 price = data.text();

					 json.title = price;})


				 fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
						console.log('File successfully written! - Check your project directory for the output.json file');
				})
		})
	}

		

res.send('Check your console!')

	});
})

app.listen('8081');
console.log('Magic happens on port 8081');
exports = module.exports = app;


//foreach poi-card-link


//nombres étoiles
//guide-icon icon-mr icon-cotation3etoiles
//guide-icon icon-mr icon-cotation2etoiles
//guide-icon icon-mr icon-cotation1etoiles

//nom restau
//poi_card-display-title

//nombre offres
//mtpb2c-offers

//type de cuisine
//poi_card-display-cuisines is-truncated

//fourchette de prix
//poi_card-display-price