"use client";

import { useState, useEffect } from "react";

const AmazonProductExtraction = () => {
  const [productUrl, setProductUrl] = useState("");
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/amazon-product?url=${productUrl}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProductData(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productUrl) {
      fetchProductData();
    }
  }, [productUrl]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const url = event.target.elements.url.value;
    setProductUrl(url);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Amazon Product Extraction</h2>
      <p>Extract product information from Amazon using a direct URL.</p>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="url"
          name="url"
          placeholder="Enter Amazon Product URL"
          className="border rounded p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded p-2 mt-2"
          disabled={loading}
        >
          {loading ? "Loading..." : "Extract"}
        </button>
      </form>

      {error && <p className="text-red-500">Error: {error.message}</p>}

      {productData && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Product Information</h3>
          <p>Title: {productData.title}</p>
          <p>Price: {productData.price}</p>
          {/* Add more product information here */}
        </div>
      )}
    </div>
  );
};

export default AmazonProductExtraction;
