const PricingPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Starter</h2>
          <p className="text-3xl font-bold mb-4">
            $49<span className="text-sm font-normal">/month</span>
          </p>
          <ul className="mb-6">
            <li>100,000 requests per month</li>
            <li>Basic API access</li>
            <li>Email support</li>
          </ul>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Start Free Trial</button>
        </div>
        <div className="bg-white p-6 rounded shadow border-2 border-blue-600">
          <h2 className="text-2xl font-semibold mb-4">Professional</h2>
          <p className="text-3xl font-bold mb-4">
            $199<span className="text-sm font-normal">/month</span>
          </p>
          <ul className="mb-6">
            <li>1,000,000 requests per month</li>
            <li>Advanced API access</li>
            <li>Priority email support</li>
            <li>Custom extraction rules</li>
          </ul>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Start Free Trial</button>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Enterprise</h2>
          <p className="text-3xl font-bold mb-4">Custom</p>
          <ul className="mb-6">
            <li>Unlimited requests</li>
            <li>Full API access</li>
            <li>24/7 phone and email support</li>
            <li>Custom integrations</li>
          </ul>
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Contact Sales</button>
        </div>
      </div>
    </div>
  )
}

export default PricingPage

