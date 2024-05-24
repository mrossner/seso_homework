const compare = (entryA, entryB) => {
    if (entryA.date > entryB.date) {
        return 1;
    } else if (entryA.date < entryB.date) {
        return -1;
    }
    return entryA.logIndex - entryB.logIndex;
}

export const findAndDeleteSmallest = (tree, parent = null) => {
    let smallest;
    if (tree === null) {
        return { tree: null, smallest: null };
    }
    if (tree.left === null) {
        smallest = tree;
        if (parent) {
            parent.left = tree.right;
        } else {
            tree = tree.right;
        }
        return { smallest, tree };
    }
    smallest =  findAndDeleteSmallest(tree.left, tree).smallest;
    return { smallest, tree };
}
export const insertbTree = (tree, entry, needCopy = true) =>  {
    if (needCopy) {
        entry = { ...entry, left: null, right: null }
    }
    if (tree === null) {
        return entry;
    }
    if (compare(entry, tree) < 0) {
        if (tree.left) {
            insertbTree(tree.left, entry, false);
        } else {
            tree.left = entry;
        }
        return tree;
    }
    if (tree.right) {
        insertbTree(tree.right, entry, false);
    } else {
        tree.right = entry
    }
    return tree;
}

// for debugging only
export const printTree = (tree) => {
    if (tree !== null) {
        printTree(tree.left);
        console.log(tree.date, tree.msg, tree.logIndex);
        printTree(tree.right);
    }
}