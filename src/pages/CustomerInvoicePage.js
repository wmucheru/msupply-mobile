/* eslint-disable react/forbid-prop-types */
/* eslint-disable import/prefer-default-export */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { MODAL_KEYS } from '../utilities';
import { useRecordListener, usePageReducer } from '../hooks';
import { recordKeyExtractor, getItemLayout } from './dataTableUtilities';

import { BottomConfirmModal, DataTablePageModal } from '../widgets/modals';
import { PageButton, PageInfo, SearchBar, DataTablePageView } from '../widgets';
import { DataTable, DataTableHeaderRow, DataTableRow } from '../widgets/DataTable';

import {
  selectRow,
  deselectRow,
  deselectAll,
  deleteTransactionItems,
} from './dataTableUtilities/actions/rowActions';

import {
  addTransactionItem,
  addMasterListItems,
  filterData,
  sortData,
} from './dataTableUtilities/actions/tableActions';
import {
  editComment,
  editTheirRef,
  openModal,
  closeModal,
} from './dataTableUtilities/actions/pageActions';
import { editTotalQuantity } from './dataTableUtilities/actions/cellActions';

import { buttonStrings, modalStrings } from '../localization';
import globalStyles, { newDataTableStyles, newPageStyles } from '../globalStyles';

/**
 * Renders a mSupply mobile page with customer invoice loaded for editing
 *
 * State:
 * Uses a reducer to manage state with `backingData` being a realm results
 * of items to display. `data` is a plain JS array of realm objects. data is
 * hydrated from the `backingData` for displaying in the interface.
 * i.e: When filtering, data is populated from filtered items of `backingData`.
 *
 * dataState is a simple map of objects corresponding to a row being displayed,
 * holding the state of a given row. Each object has the shape :
 * { isSelected, isFocused, isDisabled },
 *
 * @prop {Object} transaction The realm transaction object for this invoice.
 * @prop {Func} runWithLoadingIndicator Callback for displaying a fullscreen spinner.
 * @prop {String} routeName The current route name for the top of the navigation stack.
 */
export const CustomerInvoicePage = ({ transaction, runWithLoadingIndicator, routeName }) => {
  const [state, dispatch, instantDebouncedDispatch] = usePageReducer(routeName, {
    pageObject: transaction,
    backingData: transaction.items,
    data: transaction.items.sorted('item.name').slice(),
    keyExtractor: recordKeyExtractor,
    dataState: new Map(),
    currentFocusedRowKey: null,
    searchTerm: '',
    filterDataKeys: ['item.name'],
    sortBy: 'itemName',
    isAscending: true,
    modalKey: '',
    hasSelection: false,
    modalValue: null,
  });

  const {
    data,
    dataState,
    sortBy,
    isAscending,
    columns,
    modalKey,
    pageInfo,
    pageObject,
    hasSelection,
    keyExtractor,
    searchTerm,
    modalValue,
  } = state;

  const { isFinalised, comment, theirRef } = pageObject;

  useRecordListener(dispatch, pageObject, 'Transaction');

  const renderPageInfo = useCallback(
    () => <PageInfo columns={pageInfo(pageObject, dispatch)} isEditingDisabled={isFinalised} />,
    [comment, theirRef, isFinalised]
  );

  const getAction = useCallback((colKey, propName) => {
    switch (colKey) {
      case 'totalQuantity':
        return editTotalQuantity;
      case 'remove':
        if (propName === 'onCheckAction') return selectRow;
        return deselectRow;
      default:
        return null;
    }
  });

  const renderRow = useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = keyExtractor(item);
      const { row, alternateRow } = newDataTableStyles;
      return (
        <DataTableRow
          rowData={data[index]}
          rowState={dataState.get(rowKey)}
          rowKey={rowKey}
          style={index % 2 === 0 ? alternateRow : row}
          columns={columns}
          isFinalised={isFinalised}
          dispatch={dispatch}
          getAction={getAction}
          rowIndex={index}
        />
      );
    },
    [data, dataState]
  );

  const renderButtons = () => {
    const { verticalContainer, topButton } = globalStyles;
    return (
      <View style={verticalContainer}>
        <PageButton
          style={topButton}
          text={buttonStrings.new_item}
          onPress={() => dispatch(openModal(MODAL_KEYS.SELECT_ITEM))}
          isDisabled={isFinalised}
        />
        <PageButton
          text={buttonStrings.add_master_list_items}
          onPress={() => runWithLoadingIndicator(() => dispatch(addMasterListItems('Transaction')))}
          isDisabled={isFinalised}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <DataTableHeaderRow
      columns={columns}
      dispatch={instantDebouncedDispatch}
      sortAction={sortData}
      isAscending={isAscending}
      sortBy={sortBy}
    />
  );

  const getModalOnSelect = () => {
    switch (modalKey) {
      case MODAL_KEYS.SELECT_ITEM:
        return item => dispatch(addTransactionItem(item));
      case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
        return value => dispatch(editComment(value, 'Transaction'));
      case MODAL_KEYS.THEIR_REF_EDIT:
        return value => dispatch(editTheirRef(value, 'Transaction'));
      default:
        return null;
    }
  };
  const memoizedGetItemLayout = useCallback(getItemLayout, []);

  const {
    newPageTopSectionContainer,
    newPageTopLeftSectionContainer,
    newPageTopRightSectionContainer,
    searchBar,
  } = newPageStyles;
  return (
    <DataTablePageView>
      <View style={newPageTopSectionContainer}>
        <View style={newPageTopLeftSectionContainer}>
          {renderPageInfo()}
          <SearchBar
            onChangeText={value => dispatch(filterData(value))}
            style={searchBar}
            value={searchTerm}
          />
        </View>
        <View style={newPageTopRightSectionContainer}>{renderButtons()}</View>
      </View>
      <DataTable
        data={data}
        extraData={dataState}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={keyExtractor}
        getItemLayout={memoizedGetItemLayout}
        columns={columns}
      />
      <BottomConfirmModal
        isOpen={hasSelection}
        questionText={modalStrings.remove_these_items}
        onCancel={() => dispatch(deselectAll())}
        onConfirm={() => dispatch(deleteTransactionItems())}
        confirmText={modalStrings.remove}
      />
      <DataTablePageModal
        fullScreen={false}
        isOpen={!!modalKey}
        modalKey={modalKey}
        onClose={() => dispatch(closeModal())}
        onSelect={getModalOnSelect()}
        dispatch={dispatch}
        currentValue={modalValue}
      />
    </DataTablePageView>
  );
};

CustomerInvoicePage.propTypes = {
  runWithLoadingIndicator: PropTypes.func.isRequired,
  transaction: PropTypes.object.isRequired,
  routeName: PropTypes.string.isRequired,
};
