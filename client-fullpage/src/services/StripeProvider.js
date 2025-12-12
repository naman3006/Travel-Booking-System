// src/services/StripeProvider.jsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51SRncW2YdFnRubsyGsiVw5ceOdZSQedPLJXayWx07IF0To24I7gFaJIPSqTOOvkWsQ8awTdweSXspTJUGbxfLjTb00sWt1LvjM"
);

export const StripeProvider = ({ children }) => {
  return <Elements stripe={stripePromise}>{children}</Elements>;
};