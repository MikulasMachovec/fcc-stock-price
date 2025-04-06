'use strict';

const stock_db = require(process.cwd() + '/model/stock_DB_model.js');

const getStock = async(stock_name)=>{
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
    const foundStock = await findStock(stock_name, likes,ip)
    if(foundStock){
      return {
        'stock':foundStock.stock,
        'price':foundStock.price,
        'likes':foundStock.likes
      }
    }else{
    const newStock = new stock_db({
        stock_name: stock_name,
        price: price,
        likes: likes ? 1 : 0,
        ip: likes ? [ip] : []
    })
    await newStock.save()
    return {
      'stock':newStock.stock_name,
      'price':newStock.price,
      'likes':newStock.likes
      }
    }  
  } catch (error) {
    throw new Error('Error while saving', error.message)
  }
}

const findStock = async(stock_name, like, ip) => {
  let dbStock = await stock_db.findOne({stock_name: stock_name.toUpperCase()})
  
  if(!dbStock){
    console.log(`db for ${stock_name} does not exist`)
    return false;
  }

  if(dbStock.ip.includes(ip)){
    like = false
  }

  if (like){
    dbStock.likes += 1;
    await dbStock.save()  
  }

  return {'stock':dbStock.stock_name,
          'price':dbStock.price,
          'likes':dbStock.likes
  }
}

  const sumIp = (ip) =>{
   const cleaned = ip.replace("::ffff:","")
   const num = cleaned.split('.')
   const sum = num.reduce((acc, num)=> acc + parseInt(num),0)
   return String(sum) 
  }

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async (req, res) =>{
      let { stock, like} = req.query
      let ip = sumIp(req.ip)
      let stockData

      //changing like from string to bool value
      like = like === 'true';
      console.log('initial like '+like)
      if(Array.isArray(stock)){
        const promise = stock.map(stockItem => findStock(stockItem, like, ip))
        stockData = await Promise.all(promise)

        if (stockData.includes(false)) {
          const savePromises = stock.map(async (stockItem) => {
            const gotStockData = await getStock(stockItem);
            if (gotStockData) {
              return saveStock(gotStockData.symbol, gotStockData.latestPrice, like, ip);
            }
            return null; // If the stock is invalid (null), skip saving it
          });
          stockData = await Promise.all(savePromises);
        }

        const [firstStock, secondStock] = stockData
        
        res.json({
          'stockData':[{
            'stock' : firstStock.stock,
            'price' : firstStock.price,
            'rel_likes': firstStock.likes - secondStock.likes
          },{
            'stock' : secondStock.stock,
            'price' : secondStock.price,
            'rel_likes': secondStock.likes - firstStock.likes
            }
        ]
        })

      }else{
        const gotStock = await getStock(stock)
                
        if (gotStock == null){
          return res.json({
            'stockData': {'error': 'invalid symbol', likes: 0} 
          })
        }
        stockData = await saveStock(gotStock.symbol, gotStock.latestPrice, like, ip )
        
        return res.json({stockData})
      }

    });

    
};