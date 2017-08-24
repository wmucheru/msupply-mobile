/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

/* eslint-disable no-unused-vars */

import React from 'react';
import { AppRegistry, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import { Client as BugsnagClient } from 'bugsnag-react-native';

import { MSupplyMobileApp } from './mSupplyMobileApp';
import { reducers } from './reducers';

const bugsnagClient = new BugsnagClient();

const store = createStore(
  reducers,
  {},
  applyMiddleware(thunk),
);

const persistedStore = persistStore(store, { storage: AsyncStorage });

function App() {
  return (
    <Provider store={store}>
      <MSupplyMobileApp />
    </Provider>
  );
}

AppRegistry.registerComponent('mSupplyMobile', () => App);
