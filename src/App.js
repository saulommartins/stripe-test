import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load your Stripe public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const baseURL = process.env.REACT_APP_API_BASE_URL;

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await elements.submit();

    if (error) {
      console.error(error);
    } else {
      const paymentIntent = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: 'https://your-site.com/order/complete',
        },
      });

      if (paymentIntent.error) {
        console.error(paymentIntent.error.message);
      } else {
        console.log('PaymentIntent:', paymentIntent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || !elements}>
        Pay Now
      </button>
    </form>
  );
};

const App = () => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    console.log(`debug = ${baseURL}/create-payment-intent`);
    // Fetch the client secret from your server when the component mounts
    fetch(`${baseURL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 }), // Replace with the correct amount
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('debug = data', data);
        setClientSecret(data.clientSecret);
      });
  }, []);

  const handleFreeOrder = () => {
    fetch(`${baseURL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 0 }), // Free order
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  };
  return (
    <div>
      <h1>Stripe Google Pay Example</h1>
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
            layout: {
              type: 'accordion',
            },
            fields: {
              billingDetails: {
                email: 'never',
                phone: 'never',
                address: {
                  country: 'never',
                },
              },
            },
            paymentMethodOrder: ['google_pay', 'apple_pay', 'card'], // Specify the order of payment methods
          }}
        >
          <CheckoutForm />
          </Elements>
      )}
      <button onClick={handleFreeOrder}>Switch to Free Order</button>
    </div>
  );
};

export default App;
