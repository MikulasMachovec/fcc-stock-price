const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const stock_db = require(process.cwd() + '/model/stock_DB_model.js');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  test('view one stock in database', (done) => {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.equal(res.body.stockData.likes, 1);
        assert.exists(res.body.stockData.price, 'Stock has a price');
        done();
      });
  });

  test('view invalid stock', (done) => {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'INVALID', like: true })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.error, 'invalid symbol');
        assert.equal(res.body.stockData.likes, 0);
        done();
      });
  });


  suite('Tests with like', () => {    
    
    test('view one stock in database with like = false', (done) => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: false })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.likes, 1);
          assert.exists(res.body.stockData.price, 'Stock has a price');
          done();
        });
    });

    test('view one stock in database with like = true', (done) => {
      chai
        .request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: true })
        .end(async (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');

          const stock = await stock_db.findOne({stock_name: 'GOOG'})
          assert.equal(stock.likes,res.body.stockData.likes);
          assert.exists(res.body.stockData.price, 'Stock has a price');
          done();
        });
    });
  });

  suite('view two stocks', ()=>{
    test
  })







});
