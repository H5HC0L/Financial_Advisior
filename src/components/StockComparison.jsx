import React, { useState } from "react";

function StockComparison({ onCompare, loading }) {
  const [stockA, setStockA] = useState("");
  const [stockB, setStockB] = useState("");

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Compare Two Stocks</h3>

      <input
        type="text"
        placeholder="Stock A (e.g. AAPL)"
        value={stockA}
        onChange={(e) => setStockA(e.target.value)}
      />

      <input
        type="text"
        placeholder="Stock B (e.g. MSFT)"
        value={stockB}
        onChange={(e) => setStockB(e.target.value)}
        style={{ marginLeft: "10px" }}
      />

      <button
        onClick={() => onCompare(stockA, stockB)}
        disabled={!stockA || !stockB || loading}
        style={{ marginLeft: "10px" }}
      >
        Compare
      </button>
    </div>
  );
}

export default StockComparison;
