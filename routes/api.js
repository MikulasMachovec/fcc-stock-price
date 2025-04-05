'use strict';

const { response } = require("express");

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res) =>{
      let { stock, like} = req.query
      stock = stock.toUpperCase()
      try{
        const result = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`)
        
        if(!result.ok){
          throw new Error('Failed to fetch stock data');
        }
        const stockData = await result.json()

        console.log(stockData)
      }
      catch(error){
        console.error('Error fetching stock data:', error);
      }
    });

    
};