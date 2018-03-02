var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();






app.get('/scrape', function(req, res){

 	var json = {};
 	json['items']=[];

	for(var i=0;i<36;i++){
		url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-'+i;
		request(url, function(error, response, html){

			// First we'll check to make sure no errors occurred when making the request

			if(!error){
				var $ = cheerio.load(html);

				$('.poi-card-link').each(function(i,element){
					var item = { 'title' : '', 'stars' : '', 'nbOffres' : '', 'typeCuisine' : '', 'price' : ''}

					var data = $(this);

					item.title = data.find('.poi_card-display-title').text().trim();
					item.stars = data.find('.guide').text().trim();
					if(data.find('.icon-mr').hasClass('icon-cotation1etoile')){
						item.stars+=' 1 étoile';
					}
					if(data.find('.icon-mr').hasClass('icon-cotation2etoiles')){
						item.stars+=' 2 étoiles';
					}
					if(data.find('.icon-mr').hasClass('icon-cotation3etoiles')){
					item.stars+=' 3 étoiles';
					}

					item.nbOffres = data.find('.mtpb2c-offers').text().trim();
					item.typeCuisine = data.find('.poi_card-display-cuisines').text().trim();
					item.price = data.find('.poi_card-display-price').text().trim();
					
					json['items'].push(item);
	
				})

			fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){})
			}

		});
	}

	res.send('Check your console!');
	console.log('File successfully written! - Check the output.json file');

})

app.listen('8081');
console.log('Magic happens on port 8081/scrape');
exports = module.exports = app;
