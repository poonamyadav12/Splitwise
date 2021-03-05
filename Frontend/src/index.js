// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from '/home/poonam/Documents/Splitwise-app/splitwise-app/Frontend/src/registerserviceworker.js';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import { store } from '/home/poonam/Documents/Splitwise-app/splitwise-app/Frontend/src/_helper';
import { Provider } from 'react-redux';

//render App component on the root element
//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Provider store={store}>
  <App />
</Provider>,
  document.getElementById('root'));
registerServiceWorker();

