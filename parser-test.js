import { parser } from "./package/src/expr.js";

const code = "tweets.filter({Text: `test`, Len: 10})";
const tree = parser.parse(code);

function printTree(cursor, code, depth = 0) {
    const indent = "  ".repeat(depth);
    console.log(`${indent}${cursor.name} (${cursor.from}-${cursor.to}): '${code.slice(cursor.from, cursor.to)}'`);
    if (cursor.firstChild()) {
        do {
            printTree(cursor.node.cursor(), code, depth + 1);
        } while (cursor.nextSibling());
        cursor.parent();
    }
}

printTree(tree.cursor(), code);
