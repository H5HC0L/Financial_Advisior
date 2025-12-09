/**
 * Calculates the Simple Moving Average (SMA)
 * @param {Array} data - Array of price objects [{ close: 150.0 }, ...] (Sorted Oldest to Newest)
 * @param {number} period - The number of days to average (e.g., 50 or 200)
 * @returns {number|null} - The SMA value or null if not enough data
 */
export const calculateSMA = (data, period) => {
    // We need at least 'period' days of data to calculate an average
    if (data.length < period) return null;

    // Get the last 'period' days (the most recent ones)
    const slice = data.slice(data.length - period);

    // Sum up the closing prices
    const sum = slice.reduce((acc, curr) => acc + curr.close, 0);

    // Return the average
    return sum / period;
};

/**
 * Calculates the Relative Strength Index (RSI)
 * Standard period is usually 14 days.
 * @param {Array} data - Array of price objects (Sorted Oldest to Newest)
 * @param {number} period - Default 14
 * @returns {number|null}
 */
export const calculateRSI = (data, period = 14) => {
    if (data.length < period + 1) return null;

    let gains = 0;
    let losses = 0;

    // 1. Calculate initial average gain/loss for the first 'period'
    for (let i = 1; i <= period; i++) {
        const change = data[i].close - data[i - 1].close;
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // 2. Smooth the result for the rest of the data (Wilder's Smoothing)
    // We start from period + 1 and go to the end of the data
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i].close - data[i - 1].close;
        const currentGain = change > 0 ? change : 0;
        const currentLoss = change < 0 ? Math.abs(change) : 0;

        // Previous Avg * (Period - 1) + Current / Period
        avgGain = ((avgGain * (period - 1)) + currentGain) / period;
        avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;
    }

    // 3. Calculate RS and RSI
    if (avgLoss === 0) return 100; // Protect against division by zero
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return parseFloat(rsi.toFixed(2));
};

/**
 * Helper to determine the technical status based on indicators
 */
export const getTechnicalSummary = (currentPrice, sma50, sma200, rsi) => {
    const signals = [];

    // RSI Signals
    if (rsi > 70) signals.push("Overbought (High Risk)");
    else if (rsi < 30) signals.push("Oversold (Potential Buy)");
    else signals.push("RSI Neutral");

    // Trend Signals
    if (sma50 && sma200) {
        if (sma50 > sma200) signals.push("Golden Cross (Bullish/Uptrend)");
        else if (sma50 < sma200) signals.push("Death Cross (Bearish/Downtrend)");
    }

    // Price vs SMA
    if (sma50 && currentPrice > sma50) signals.push("Price above 50-day avg (Strong)");
    else if (sma50 && currentPrice < sma50) signals.push("Price below 50-day avg (Weak)");

    return signals.join(". ");
};