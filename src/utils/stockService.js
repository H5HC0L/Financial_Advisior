import axios from 'axios';
import { twelveDataApiKey } from '../config/apiKeys';

// This is the main function we will call from our screens
// It takes a 'symbol' (like 'TSLA') as an argument
export const fetchHistoricalData = async (symbol) => {
    try {
        // 1. Handle Crypto Symbols automatically
        let querySymbol = symbol;
        const cryptoMap = {
            'BTC': 'BTC/USD',
            'ETH': 'ETH/USD',
            'SOL': 'SOL/USD',
            'DOGE': 'DOGE/USD',
            'XRP': 'XRP/USD',
            'ADA': 'ADA/USD',
            'BNB': 'BNB/USD'
        };
        if (cryptoMap[symbol]) {
            querySymbol = cryptoMap[symbol];
        }

        // 2. Construct the API URL
        // INCREASED outputsize to 5000 to support 1-year forecasts and robust volatility calculation
        const url = `https://api.twelvedata.com/time_series?symbol=${querySymbol}&interval=1day&outputsize=5000&apikey=${twelveDataApiKey}`;

        console.log(`Fetching history for ${querySymbol}...`); 

        // 3. Make the request
        const response = await axios.get(url);
        const data = response.data;

        // 4. Check for API errors 
        if (data.code && data.code !== 200) {
            console.error("API Error:", data.message);
            return null; 
        }

        if (!data.values || data.values.length === 0) {
             console.warn(`No data values returned for ${querySymbol}`);
             return null;
        }

        // 5. Transform the data
        const cleanData = data.values.map(day => ({
            date: day.datetime,
            close: parseFloat(day.close)
        })).reverse();

        return cleanData;

    } catch (error) {
        console.error("Network or Server Error:", error);
        return null;
    }
};