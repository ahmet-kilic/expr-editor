import { parser } from "./expr.js"

const code1 = "let x = 42; x * 2"
const tree1 = parser.parse(code1)
console.log("Tree 1:", tree1.toString())

const code2 = "filter([1, 2], { # > 1 })"
const tree2 = parser.parse(code2)
console.log("Tree 2:", tree2.toString())
