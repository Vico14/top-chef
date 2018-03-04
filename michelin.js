var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){

 	var json = {};
 	json['items']=[];
 	var url2 = 'https://restaurant.michelin.fr'

	for(var i=0;i<36;i++){
		url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-'+i;

		request(url, function(error, response, html){

			if(!error){
				var $ = cheerio.load(html);

				$('.view-mode-poi_card').each(function(i,element){
		    		var url_scrapped = $(this).find('.poi-card-link').attr('href');
		    		var url3= url2+url_scrapped;

		    		request(url3, function(error, response, html){

						if(!error){

							var $ = cheerio.load(html);
							var item = { 'title' : '','adress': {'street_block':'','postal_code':'','locality':''}, 'stars' : '',
							'offres': [], 'typeCuisine' : '', 'price' : '','chef':''}

							item.title = $('.poi_intro-display-title').text().trim();
							item.stars = $('.guide').text().trim();
							if($('.guide').children().first().attr('class')=="guide-icon icon-mr icon-cotation1etoile"){
								item.stars+=' 1 étoile';
							}
							if($('.guide').children().first().attr('class')=="guide-icon icon-mr icon-cotation2etoiles"){
								item.stars+=' 2 étoiles';
							}
							if($('.guide').children().first().attr('class')=="guide-icon icon-mr icon-cotation3etoiles"){
							item.stars+=' 3 étoiles';
							}

							item.adress.street_block= $('.thoroughfare').first().text().trim();
							item.adress.postal_code = $('.postal-code').first().text().trim();
							item.adress.locality = $('.locality').first().text().trim();

							if($('.view-restaurant-offers')[0]){
					    		$('.view-restaurant-offers').children('.view-content').children().each(function(i,element){
					    			var info_offres = {'description': '', 'validity': ''};
					    			info_offres.description= $(this).find('.title-wrapper').children().text().trim();
					    			info_offres.validity= $(this).find('.validity-dates-wrapper').text().trim();
					    			item.offres.push(info_offres);
					    		})
					    	}
							item.typeCuisine = $('.poi_intro-display-cuisines').text().trim();
							item.price = $('.poi_intro-display-prices').text().trim();
							item.chef = $('.field--name-field-chef').children('.field__items').children().first().text().trim();
							
							json['items'].push(item);
						

							fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){})
						}
					})
				})	
			}
		});
	}

	res.send('Check your console!');
	console.log('File successfully written! - Check the output.json file');

})

app.listen('8081');
console.log('goto : localhost:8081/scrape');
exports = module.exports = app;

//field field--name-field-address field--type-addressfield field--label-hidden opt-upper-var2__address-wrapper