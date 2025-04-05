'use strict';

const stock_db = require(process.cwd() + '/model/stock_DB_model.js');

const getStock = async(stock_name)=>{
  stock_name = stock_name.toUpperCase()
      try{
        const result = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock_name}/quote`)
        
        if(!result.ok){
          throw new Error('Failed to fetch stock data');
        }


        const __stockData = await result.json()
        const {symbol, latestPrice} = __stockData
        if(symbol == undefined || latestPrice == undefined){
          return null;
        } else{
        return {symbol, latestPrice}
        }
      }
      catch(error){
        throw new Error('Error fetching stock data:', error);
      }
}; 
const saveStock = async(stock_name, price, likes, ip) =>{
  try {
    console.log(stock_name, price, likes, ip)
    const newStock = new stock_db({
        stock_name: stock_name,
        price: price,
        likes: likes ? 1 : 0,
        ip: ip ? [ip]: []
    })
    await newStock.save()
    return newStock
  } catch (error) {
    throw new Error('Error while saving', error.message)
  }
}

const findStock = async(stock_name, like) => {
  let dbStock = await stock_db.findOne({stock_name: stock_name})

  if(dbStock){
    dbStock.likes += like? 1:0
    await dbStock.save()
  }
  return dbStock
}







module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res) =>{
      let { stock, like} = req.query
      let ip = req.ip.slice(0,-4)
      const stockData = await getStock(stock)
      
      if (stockData == null){
        return res.json({
          'stockData': {'error': 'invalid symbol', likes: 0} 
        })
      }

      const stockData_from_DB = await findStock(stockData.symbol,like)
      if (stockData_from_DB == null){
      const savedStock = await saveStock(stockData.symbol, stockData.latestPrice, like, ip )
      console.log(savedStock)  
      }
    });

    
};