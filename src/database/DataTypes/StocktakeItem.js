import Realm from 'realm';

import { getTotal, createRecord } from '../utilities';

export class StocktakeItem extends Realm.Object {
  destructor(database) {
    if (this.stocktake && this.stocktake.isFinalised) {
      throw new Error('Cannot delete a StocktakeItem belonging to a finalised stocktake');
    }
    database.delete('StocktakeBatch', this.batches);
  }

  get snapshotTotalQuantity() {
    return getTotal(this.batches, 'snapshotTotalQuantity');
  }

  get countedTotalQuantity() {
    return getTotal(this.batches, 'countedTotalQuantity');
  }

  get difference() {
    return getTotal(this.batches, 'difference');
  }

  get itemId() {
    return this.item ? this.item.id : '';
  }

  get itemName() {
    return this.item ? this.item.name : '';
  }

  get itemCode() {
    return this.item ? this.item.code : '';
  }

  get hasBatchWithQuantityChange() {
    console.log('batch changed', this.batches.some(stocktakeBatch => stocktakeBatch.difference !== 0));
    return this.batches.some(stocktakeBatch => stocktakeBatch.difference !== 0);
  }

  get numberOfBatches() {
    return this.batches.length;
  }

  /**
   * If the stock has increased or not been changed since the item quantity was
   * snapshot, the minimum is 0. If the stock has reduced since the item was
   * snapshot, the minimum total quantity that can be sensibly considered as the
   * counted quantity is the snapshot quantity minus the current stock on hand.
   * This is because it doesn't make sense to count an amount that represents a
   * reduction greater than the current stock on hand, which would create negative
   * inventory.
   * @return {integer} The minimum total quantity that can be sensibly counted
   */
  get minimumTotalQuantity() {
    return this.item ? Math.max(0, this.snapshotTotalQuantity - this.item.totalQuantity) : 0;
  }

  /**
   * Returns true if this stocktake item's counted quantity would reduce the amount
   * of stock in inventory to negative levels, if it were finalised. This can happen
   * if, for example, an item is added to a stocktake with a snapshot quantity of
   * 10, then is counted to have a quantity of 8, but concurrently there has been
   * a reduction in the stock in inventory, e.g. a customer invoice for 9. In this
   * example, the stock on hand is now 1, so a reduction of 2 caused by this stocktake
   * item would result in negative inventory.
   * @return {Boolean} Whether the counted quantity is below the minimum for this item
   */
  get isReducedBelowMinimum() {
    const countedTotalQuantity = this.countedTotalQuantity;
    return countedTotalQuantity !== undefined &&
           countedTotalQuantity !== null &&
           countedTotalQuantity < this.minimumTotalQuantity;
  }

  setCountedTotalQuantity(database, quantity) {
    let difference = quantity - this.countedTotalQuantity;
    if (difference === 0) return;

    database.write(() => {
      // Create batch
      if (this.batches.length === 0) {
        this.addNewBatch(database);
      }
      const isIncreasingQuantity = difference > 0;
      const sortedBatches = this.batches.sorted('expiryDate', isIncreasingQuantity);

      sortedBatches.some(stocktakeBatch => {
        const batchTotalQuantity = stocktakeBatch.countedTotalQuantity;

        let thisBatchChangeQuantity = 0;
        if (isIncreasingQuantity) {
          thisBatchChangeQuantity = Math.min(stocktakeBatch.snapshotTotalQuantity -
                                            batchTotalQuantity, difference);
          // In-case manually entered a Actual Quantity for a batch
          // that is above batch Snapshot Quantity
          if (thisBatchChangeQuantity <= 0) return false;
        } else {
          thisBatchChangeQuantity = Math.min(batchTotalQuantity, -difference);
          thisBatchChangeQuantity = -thisBatchChangeQuantity;
        }

        stocktakeBatch.countedTotalQuantity = batchTotalQuantity + thisBatchChangeQuantity;

        database.save('StocktakeBatch', stocktakeBatch);

        difference -= thisBatchChangeQuantity;
        return difference === 0;
      });

      if (difference > 0) {
        const earliestExpiryBatch = sortedBatches[0];

        earliestExpiryBatch.countedTotalQuantity += difference;
        database.save('StocktakeBatch', earliestExpiryBatch);
      }
    });
  }

  addBatch(stocktakeBatch) {
    this.batches.push(stocktakeBatch);
  }

  addNewBatch(database) {
    const batchString = `stocktake_${this.stocktake.serialNumber}`;
    const itemBatch = createRecord(database, 'ItemBatch', this.item, batchString);
    createRecord(database, 'StocktakeBatch', this, itemBatch, true);
  }
}

StocktakeItem.schema = {
  name: 'StocktakeItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    stocktake: 'Stocktake',
    batches: { type: 'list', objectType: 'StocktakeBatch' },
  },
};
