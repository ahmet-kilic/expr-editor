import { parser } from "./expr.js"

const code = "a and b"
const tree = parser.parse(code)
let cursor = tree.cursor()
do {
    console.log(cursor.name, JSON.stringify(code.slice(cursor.from, cursor.to)))
} while (cursor.next())
