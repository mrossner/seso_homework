"use strict";
import { findAndDeleteSmallest, insertbTree } from "./marc-btree.js";

// Print all entries, across all of the *async* sources, in chronological order.

// pretty much same logic as in sync-sorted-merge, with the asynchronicity manage
// note you cannot have multiple outstanding unresolved promises to popAsync for
// SAME logsource as it just returns a member this.last (d'oh) so doesn't work
// like it "could". But I CAN have multiple promises across multiple (different) log sources
// so I can "prime the btree pump" with a set of promises that I await with '.all()
const asyncSortedMerge = (logSources, printer) => {
    return new Promise(async (resolve, reject) => {
        // build initial tree with first line of logsource (smallest from each source)
        // note each entry is annotated with a logIndex, so I know the source of the
        // "previous smallest entry" and can iterate through that source printing entries
        // WITHOUT adding them to tree until I find one greater than the NExT SMALLEST
        let entry;
        let bTree = null;
        const allSourcePromises = [];

        // I need to return an augmented entry with the log index, since this is
        // how my "cool logic" works
        const getEntryWithLogIndex = (index) => {
            return new Promise((resolve) => {
                logSources[index].popAsync().then((data) => {
                    if (data) {
                        data.logIndex = index;
                    }
                    resolve(data);
                });
            });
        }

        logSources.forEach((logSource, index) => {
            allSourcePromises.push(getEntryWithLogIndex(index));
        });

        await Promise.all(allSourcePromises).then((data) => {
            data.forEach((entry) => { 
                if (entry) {
                    bTree = insertbTree(bTree, entry);
                }
            });
        });

        // prime the pump --- smallest in tree is absolute smallest
        let { smallest, tree} = findAndDeleteSmallest(bTree);

        // now this is whole loop. print the smallest and retrieve its log index
        // as "previous smallest". 
        // now get NEXT smallest
        // Now go through that logsource (from previous smallest) printing entries NOT
        // adding to the tree until you find one GREATER than the NEXT SMALLEST
        // when you find that guy (not ready to print yet) insert him back into the tree
        // when  everything is exhausted (no more waiting)
        while (smallest) {
                printer.print(smallest);

                const nextIndexToCheck = smallest.logIndex;
                const nextResult  = findAndDeleteSmallest(tree);
                tree = nextResult.tree;
                smallest = nextResult.smallest;

                // modification of the loop from the sync example. Can only get
                // ONE AT A TIME as noted before (hence the "await")
                while (entry = await logSources[nextIndexToCheck].pop()) {
                    entry.logIndex = nextIndexToCheck;
                    if (!smallest || (entry.date < smallest.date)) {
                        printer.print(entry);
                        //console.log(entry.date, entry.msg, entry.logIndex);
                    } else {
                        break;
                    }
                }
                if (smallest && entry) {
                    tree = insertbTree(tree, entry);
        
                }
        }
        printer.done();

        resolve(console.log("Async sort complete."));
    });
};

export default asyncSortedMerge;
