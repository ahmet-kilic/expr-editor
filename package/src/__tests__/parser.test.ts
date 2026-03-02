import { expect, test } from 'vitest';
import { parser } from "../expr.js";

test('parser sequence and slices', () => {
    const code = "a and b";
    const tree = parser.parse(code);
    let cursor = tree.cursor();

    const nodes: { name: string, slice: string }[] = [];
    do {
        nodes.push({ name: cursor.name, slice: code.slice(cursor.from, cursor.to) });
    } while (cursor.next());

    expect(nodes).toEqual([
        { name: "Program", slice: "a and b" },
        { name: "ExpressionStatement", slice: "a and b" },
        { name: "BinaryExpression", slice: "a and b" },
        { name: "Identifier", slice: "a" },
        { name: "LogicOp", slice: "and" },
        { name: "Identifier", slice: "b" }
    ]);
});
