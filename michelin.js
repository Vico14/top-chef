var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var michelin = express();
var lafourchette = require('./lafourchette.js');





function get_page_urls(i) {
    return new Promise((resolve, reject) => {
    	var page_urls=[];
    	var michelin_url = 'https://restaurant.michelin.fr';
		url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin/page-'+i;
		request(url, function(error, response, html){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(html);
				$('.view-mode-poi_card').each(function(i,element){
		    		var restaurant_url = $(this).find('.poi-card-link').attr('href');
		    		page_urls.push(michelin_url+restaurant_url);
		    	});
		    	resolve(page_urls);
		    }
		});
	});
}


function gather_all_urls(){
    return new Promise((resolve, reject) => {
    	var get_page_urls_array = [];
    	var all_urls=[];
    	for(var i=1;i<36;i++){
    		get_page_urls_array.push(get_page_urls(i));
    	}
    	Promise.all(get_page_urls_array).then(values=>{
			values.forEach(function(url){
				all_urls = all_urls.concat(url);		
			})
			resolve(all_urls);
		})
	});
}



function scrap_all_restaurants(all_urls){
    return new Promise((resolve, reject) => {
    	var all_restaurants=[];
		var restaurant=[];
		all_urls.forEach(function(url){
			restaurant.push(scrap_a_restaurant(url));
		})
		Promise.all(restaurant).then(values=>{
			values.forEach(function(url){
				all_restaurants = all_restaurants.concat(url);			
			})	
		resolve(all_restaurants);
		});

	});
}


function scrap_a_restaurant(url){
    return new Promise((resolve, reject) => {
    	request(url, function(error, response, html){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(html);
					var item = { 'title' : '','address': {'street_block':'','postal_code':'','locality':''}, 'stars' : '',
					 'typeCuisine' : '', 'price' : '','chef':'','offres_michelin': [],'offres_lafourchette': []};

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

					item.address.street_block= $('.thoroughfare').first().text().trim();
					item.address.postal_code = $('.postal-code').first().text().trim();
					item.address.locality = $('.locality').first().text().trim();

					if($('.view-restaurant-offers')[0]){
			    		$('.view-restaurant-offers').children('.view-content').children().each(function(i,element){
			    			var info_offres = {'description': '', 'validity': ''};
			    			info_offres.description= $(this).find('.title-wrapper').children().text().trim();
			    			info_offres.validity= $(this).find('.validity-dates-wrapper').text().trim();
			    			item.offres_michelin.push(info_offres);
			    		})
			    	}
					item.typeCuisine = $('.poi_intro-display-cuisines').text().trim();
					item.price = $('.poi_intro-display-prices').text().trim();
					item.chef = $('.field--name-field-chef').children('.field__items').children().first().text().trim();
					resolve(item);
		    }
		})
	});
}






function add_lafourchette_offres(restaurants){
    return new Promise((resolve, reject) => {
    	var restaurants_full=[];
    	restaurants.forEach(function(restaurant){
			restaurants_full.push(lafourchette.gather_all_offres(restaurant));
		})
		Promise.all(restaurants_full).then(values=>{
			resolve(values);
		});

	});	
}



async function main_michelin(){

	console.log('urls...');
	var urls = await gather_all_urls();
	console.log('michelin');
	var all_restaurants = await scrap_all_restaurants(urls);
	console.log('lafourchette');
	var all_restaurants_with_offres = await add_lafourchette_offres(all_restaurants);

	fs.writeFile('output.json', JSON.stringify(all_restaurants_with_offres, null, 4), function(err){})
	console.log('check output.json file');

	/*var restaurants=fs.readFileSync('input.json','UTF-8');
	var restau=JSON.parse(restaurants);	
	var rest= await add_lafourchette_offres(restau);
	console.log(rest);
	fs.writeFile('output.json', JSON.stringify(rest, null, 4), function(err){})
	*/

}

main_michelin();




