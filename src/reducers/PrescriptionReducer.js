/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../navigation/constants';
import { UIDatabase } from '../database';
import { createRecord } from '../database/utilities/index';

const initialState = () => ({
  currentTab: 0,
  patient: null,
  prescriber: null,
  itemsById: {},
  items: [],
});

const ACTIONS = {
  SWITCH_TAB: 'DISPENSARY/SWITCH_TAB',
};

export const switchTab = nextTab => ({
  type: ACTIONS.SWITCH_TAB,
  payload: { nextTab },
});

export const selectPrescriber = prescriberID => (dispatch, getState) => {
  const { dispensary } = getState();

  const { prescription, currentTab } = dispensary;

  const prescriber = UIDatabase.get('Prescriber', prescriberID);

  UIDatabase.write(() =>
    UIDatabase.update('Transaction', {
      ...prescription,
      prescriber,
    })
  );

  dispatch(switchTab(currentTab + 1));
};

export const selectItem = itemID => (dispatch, getState) => {
  const { dispensary } = getState();
  const { prescription } = dispensary;
  const item = UIDatabase.get('Item', itemID);

  if (!prescription.hasItem(item)) {
    UIDatabase.write(() => {
      createRecord(UIDatabase, 'TransactionItem', prescription, item);
    });
  }

  dispatch({ type: 'SELECT_ITEM' });
};

export const PrescriptionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;

      if (routeName !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;

      return { ...state, prescription: transaction };
    }

    case ACTIONS.SWITCH_TAB: {
      const { payload } = action;
      const { nextTab } = payload;
      return { ...state, currentTab: nextTab };
    }

    case 'SELECT_ITEM': {
      return {
        ...state,
        prescription: UIDatabase.objects('Prescription').filtered(
          'id == $0',
          state.prescription.id
        )[0],
      };
    }

    default:
      return state;
  }
};
