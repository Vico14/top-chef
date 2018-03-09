var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var accents = require('remove-accents');

var unResto={
        "title": "Le Chibérta",
        "chef": "Stéphane Laruelle",
        "description": "Cuisine Moderne, Créative; Gastronomique; Végétarien; Végétalien",
        "specialities": "Saumon façon ″gravlax″ en tartare panna cotta de brocolis, chantilly iodée",
        "address": {
            "street_block": "3 Rue Arsène Houssaye",
            "postal_code": "75008",
            "locality": "Paris 08"
        },
        "price": "Prix - De 49 € à 120 €",
        "stars": 1,
        "contact_details": {
            "phone": "01 53 53 42 00",
            "website": "http://www.lechiberta.com"
        },
        "offers": [
            {
                "description": "Instant Etoilé: Menu Dégustation 7 services: 99€ au lieu de 110€",
                "availability": "Offre valable du 15/02/2018 au 30/04/2018"
            },
            {
                "description": "Instant Etoilé: Menu Dégustation accord mets et vins 7 services: 149€ au lieu de 165€",
                "availability": "Offre valable du 15/02/2018 au 30/04/2018"
            }
        ],
        "offres_lafourchette": []
    };







function get_restaurant_offres(url){
	 return new Promise((resolve, reject) => {
    	request(url, function(error, response, html){
			if(!error && response.statusCode == 200){
				var $ = cheerio.load(html);
				offres=[];
				var scrapped_json = $('body').text();
				var parsed_json= JSON.parse(scrapped_json);
				for(var i=0;i<parsed_json.length;i++)
				{
					if( parsed_json[i].is_special_offer == true){
						var lafourchette_offre = {'title': '', 'description': ''};
						lafourchette_offre.title = parsed_json[i].title;
						lafourchette_offre.description = parsed_json[i].description;
						offres.push(lafourchette_offre);
						
					}
					resolve(offres);


				}
				resolve("");
				
		    }
		    resolve([]);
		})
	});
}



function get_lafourchette_offre_url(restaurant){
	return new Promise((resolve, reject) => {
		if(restaurant.title){
	 		var title_modified = restaurant.title.replace(/'|_|&| /g,"-");
	 		title_modified = accents.remove(title_modified);
		 	var postal_code =  restaurant.address.postal_code
		 	var url = 'https://m.lafourchette.com/api/restaurant-prediction?name='+ title_modified;
	    	request(url, function(error, response, html){
				if(!error && response.statusCode == 200){
					var $ = cheerio.load(html);
					var scrapped_json = $('body').text();
					parsed_json =  JSON.parse(scrapped_json);
					for(var i=0;i<parsed_json.length;i++)
					{
						if( parsed_json[i].address.postal_code==postal_code){
							var lafourchette_offre_url = 'https://m.lafourchette.com/api/restaurant/'+parsed_json[i].id+'/sale-type';
							resolve(lafourchette_offre_url);
						}
					}
					resolve("");

			    }
			    resolve("");
			})
	    }
	});
}


function gather_all_offres(restaurant){
    return new Promise((resolve, reject) => {
    	get_lafourchette_offre_url(restaurant).then(function(url){
    		get_restaurant_offres(url).then(function(deals){
    			restaurant.offres_lafourchette = deals;
    			resolve(restaurant);
    		})
    	});
    }) 	
}


async function main_lafourchette(){

	//var all_restaurants  = await  michelin.main_michelin();
	//gather_all_ids(all_restaurants);


	//var test = get_lafourchette_offre_url(unResto);
	//console.log(test);
	gather_all_offres(unResto);


}

main_lafourchette();







module.exports.gather_all_offres = gather_all_offres;
