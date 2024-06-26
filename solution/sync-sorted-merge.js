"use strict";
import { findAndDeleteSmallest, insertbTree} from "./marc-btree.js";

// Print all entries, across all of the sources, in chronological order.

/***** 
 Structure holding 'entries queued to be printed' is a binary tree
 implementation in marc-btree.js (just some functions, not a class)

 enter an entry into structure
 (a) as I scan FIRST entry in each logfile to find the 'first lowest entry'
 (b) if I am scanning the file from the 'previous lowest entry' and find an
 entry greater than NEXT lowest entry

 So note a lot of the time I can just scan a file (from PREVIOUS lowest entry) and
 its entries are still lower than NEXT LOWEST in queue. So can just print them without
 entering them into the bTree. So the bTree will basically hold at most one entry per
 logsource 'already read and waiting to be printed' behind other entries in a different file.

 So a million logsources = a million entries in the tree and all the inserting navigating
 is O(Log n) so just max 20 navigations in the tree regardless.

 I did NOT want to do a binary search in an order list since insertion performance would
 be O(N). Here NO structure navigation is O(N)

 ************/
 


const syncSortedMerge =  (logSources, printer)=> {
    // build initial tree with first line of logsource (smallest from each source)
    // note each entry is annotated with a logIndex, so I know the source of the
    // "previous smallest entry" and can iterate through that source printing entries
    // WITHOUT adding them to tree until I find one greater than the NExT SMALLEST
    let entry;
    let bTree = null;

    logSources.forEach((logSource, index) => {
        if (entry = logSource.pop()) {
            entry.logIndex = index;
            bTree = insertbTree(bTree, entry)
        }
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
        while (entry = logSources[nextIndexToCheck].pop()) {
            entry.logIndex = nextIndexToCheck;
            if (!smallest || (entry.date < smallest.date)) {
                printer.print(entry);
            } else {
                break;
            }
        }
        if (smallest && entry) {
            tree = insertbTree(tree, entry);

        }
    }
    printer.done();


    return console.log("Sync sort complete.");
};

export default syncSortedMerge;