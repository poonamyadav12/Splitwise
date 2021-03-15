import axios from "axios";
var _ = require('lodash');
var numeral = require('numeral');

export const CURRENCY = [
  { 'name': "USD" },
  { 'name': "KWD" },
  { 'name': "BHD" },
  { 'name': "GBP" },
  { 'name': "EUR" },
  { 'name': "CAD" },
];

export const COUNTRY = Object.freeze(
  {
    US: "United States",
    KW: "Kuwait",
    BH: "Bahrain",
    GB: "United Kingdom",
    CA: "Canada",
  }
);

export const CURRENCYFORMAT = Object.freeze(
  {
    USD: '$0,0[.]00',
    KWD: 'KD0,0[.]00',
    BHD: 'BD0,0[.]00',
    GBP: '£0,0[.]00',
    EUR: '€0,0[.]00',
    CAD: 'C$0,0[.]00',
  }
);

export const formatMoney = (amount, currencyCode) => {
  return numeral(amount).format(CURRENCYFORMAT[currencyCode]);
}

// 996f6a1ca5b62e3880e60c32e1f21a1c
// http://data.fixer.io/api/latest?access_key=996f6a1ca5b62e3880e60c32e1f21a1c&symbols=USD,KWD,GBP,EUR,BHD,CAD

var rates = [];
const getExchangeRates = () => {
  axios.get(`http://data.fixer.io/api/latest?access_key=996f6a1ca5b62e3880e60c32e1f21a1c&symbols=USD,KWD,GBP,EUR,BHD,CAD`).then(
    (response) => {
      rates = response.data.rates;
    }
  );
}
getExchangeRates();

export const convertAmount = (amount, sourceCurrencyCode, trargetCurrencyCode) => {
  const cachedExchangedRates = rates;
  const sourceRate = cachedExchangedRates[sourceCurrencyCode];
  const destinationRate = cachedExchangedRates[trargetCurrencyCode];
  const amountProcessed = (destinationRate * amount) / sourceRate;
  return amountProcessed;
}

