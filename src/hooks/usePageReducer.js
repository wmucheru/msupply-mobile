/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { useReducer, useCallback, useMemo } from 'react';
import getReducer from '../pages/dataTableUtilities/reducer/getReducer';
import getColumns from '../pages/dataTableUtilities/columns';
import getPageInfo from '../pages/dataTableUtilities/pageInfo';
import { debounce } from '../utilities/index';

/**
 * useReducer wrapper for pages within the app. Creates a
 * composed reducer through getReducer for a particular
 * page as well as fetching the required data table columns
 * and page info columns and inserting them into the initial
 * state of the component.
 *
 * Dispatch returned from useReducer is wrapped allowing the use
 * of thunks. Actions can return either a plain object or a function.
 * If a function is returned, it is called, rather than dispatched,
 * allowing actions to perform side-effects.
 *
 * Returns the current state as well as three dispatchers for
 * actions to the reducer - a regular dispatch and two debounced
 * dispatchers - which group sequential calls within the timeout
 * period, call either the last invocation or the first within
 * the timeout period.
 * @param {String} page                   routeName for the current page.
 * @param {Object} initialState           Initial state of the reducer
 * @param {Number} debounceTimeout        Timeout period for a regular debounce
 * @param {Number} instantDebounceTimeout Timeout period for an instant debounce
 */
const usePageReducer = (
  page,
  initialState,
  debounceTimeout = 250,
  instantDebounceTimeout = 250
) => {
  const columns = useMemo(() => getColumns(page), [page]);
  const pageInfo = useMemo(() => getPageInfo(page), [page]);
  const memoizedReducer = useMemo(() => getReducer(page), []);
  const [state, dispatch] = useReducer(memoizedReducer, {
    ...initialState,
    columns,
    pageInfo,
  });

  const thunkDispatcher = action => {
    if (typeof action === 'function') action(dispatch, state);
    else dispatch(action);
  };

  const debouncedDispatch = useCallback(debounce(thunkDispatcher, debounceTimeout), []);
  const instantDebouncedDispatch = useCallback(
    debounce(thunkDispatcher, instantDebounceTimeout, true),
    []
  );

  return [state, thunkDispatcher, instantDebouncedDispatch, debouncedDispatch];
};

export default usePageReducer;
