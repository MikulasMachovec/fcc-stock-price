const mongoose = require('mongoose');
const { Schema } = mongoose;

const stock_db = require(process.cwd() + '/model/stock_DB_model.js');


module.exports = function (app) {
    (async () => {
        try {
            if (!process.env.DB) throw new Error("Database URL (DB) is missing in environment variables.");

            await mongoose.connect(process.env.DB);
            console.log('Database connected successfully');
            
            app.locals.stock_db = stock_db;
        
        } catch (error) {
            console.error( error.message );
        }
    })();
};