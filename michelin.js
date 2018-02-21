const michelin = require('michelin');
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

console.log(michelin.get());




app.get('/scrape', function(req, res){
    // The URL we will scrape from - in our example Anchorman 2.

    url = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            var $ = cheerio.load(html);

            var title, stars, nbOffres, typeCuisine, price;
            var json = { title : "", stars : "", nbOffres : "", typeCuisine : "", price : ""};
            var $ = cheerio.load(html);


            $('.poi_card-display-title').filter(function(){


                 var data = $(this);

                 title = data.children().first().text();

                 json.title = title;}

             $('.poi_card-display-title').filter(function(){


                 var data = $(this);
 
                 stars = data.children().first().text();

                 json.title = 3;}

             $('.mtpb2c-offers').filter(function(){


                 var data = $(this);

                 nbOffres = data.text();

                 json.title = nbOffres;}


             $('.poi_card-display-cuisines is-truncated').filter(function(){


                 var data = $(this);

                 typeCuisine = data.text();

                 json.title = typeCuisine;}


             $('.poi_card-display-price').filter(function(){


                 var data = $(this);

                 price = data.text();

                 json.title = price;}
        }
    })
})
app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;




/* 
nombres étoiles
guide-icon icon-mr icon-cotation3etoiles
guide-icon icon-mr icon-cotation2etoiles
guide-icon icon-mr icon-cotation1etoiles

nom restau
poi_card-display-title

nombre offres
mtpb2c-offers

type de cuisine
poi_card-display-cuisines is-truncated

fourchette de prix
poi_card-display-price