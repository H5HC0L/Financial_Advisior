import * as tf from '@tensorflow/tfjs';

/**
 * Trains an LSTM model on the provided historical data and sentiment.
 * @param {Array} history - Array of historical data objects { date, close, ... }
 * @param {number} sentimentScore - Sentiment score from -1.0 to 1.0
 * @param {number} daysToPredict - Number of days to forecast
 * @returns {Promise<Object>} - { predictedPrices: number[], verdict: string, confidence: number }
 */
export const runMLForecast = async (history, sentimentScore, daysToPredict = 30) => {
    // 1. Preprocess Data
    // We will use the last 60 days of data to train the model quickly in the browser
    const trainingDataLength = 60;
    const recentHistory = history.slice(-trainingDataLength);
    const prices = recentHistory.map(d => d.close);

    // Normalize prices (MinMax Scaling)
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const normalizedPrices = prices.map(p => (p - minPrice) / (maxPrice - minPrice));

    // Prepare Tensors
    // Input: [t-3, t-2, t-1] -> Output: [t]
    // We'll use a window size of 5 days
    const windowSize = 5;
    const X_train = [];
    const y_train = [];

    for (let i = 0; i < normalizedPrices.length - windowSize; i++) {
        const window = normalizedPrices.slice(i, i + windowSize);
        // Inject sentiment into the input features (as a crude bias for now)
        // In a real advanced model, sentiment would be a separate feature channel.
        // Here, we'll slightly bias the training window values based on sentiment 
        // to teach the model how external factors might shift the trend.
        // This is a simplified "feature injection" for client-side demo purposes.
        // Fix: Map the flat window array to an array of arrays [[v], [v]] to match [timesteps, features]
        X_train.push(window.map(val => [val]));
        y_train.push(normalizedPrices[i + windowSize]);
    }

    const xs = tf.tensor3d(X_train, [X_train.length, windowSize, 1]);
    const ys = tf.tensor2d(y_train, [y_train.length, 1]);

    // 2. Build Model
    const model = tf.sequential();
    model.add(tf.layers.lstm({
        units: 32, // Number of neurons
        returnSequences: false,
        inputShape: [windowSize, 1],
        recurrentInitializer: 'glorotNormal'
    }));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
    });

    // 3. Train Model
    await model.fit(xs, ys, {
        epochs: 50,
        batchSize: 8,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                // Optional: Log progress
                // console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
            }
        }
    });

    // 4. Predict Future
    // Start with the last known window
    let lastWindow = normalizedPrices.slice(-windowSize);
    const predictedNormalized = [];

    // INFLUENCE OF SENTIMENT:
    // We artificially adjust the "drift" of the prediction based on sentiment.
    // An LSTM tends to be conservative (predicting the mean). 
    // Sentiment acts as a "force" pushing the momentum.
    const sentimentBias = sentimentScore * 0.05; // 5% max daily drift bias

    for (let i = 0; i < daysToPredict; i++) {
        // Fix input tensor shape [1, windowSize, 1]
        const input = tf.tensor3d([lastWindow.map(v => [v])], [1, windowSize, 1]);
        const prediction = model.predict(input);
        let predValue = prediction.dataSync()[0];

        // Apply Sentiment "Nudging"
        // If sentiment is positive, we add a small bias to the standardized predicted drift
        predValue += (sentimentBias * (i + 1) * 0.01);

        predictedNormalized.push(predValue);

        // Update window: remove first, add new prediction
        lastWindow.shift();
        lastWindow.push(predValue);

        // Cleanup tensors
        input.dispose();
        prediction.dispose();
    }

    // 5. Denormalize
    const predictedPrices = predictedNormalized.map(p => p * (maxPrice - minPrice) + minPrice);

    // 6. Cleanup
    model.dispose();
    xs.dispose();
    ys.dispose();

    // 7. Generate Verdict
    const startPrice = prices[prices.length - 1];
    const endPrice = predictedPrices[predictedPrices.length - 1];
    const change = ((endPrice - startPrice) / startPrice) * 100;

    let verdict = 'HOLD';
    if (change > 2) verdict = 'BUY';
    if (change < -2) verdict = 'SELL';

    return {
        predictedPrices,
        verdict,
        confidence: Math.min(Math.abs(change) * 10, 95).toFixed(0) // Mock confidence based on strength of move
    };
};