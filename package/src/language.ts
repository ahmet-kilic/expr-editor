import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import { parser } from "./expr.js";

export const exprLanguage = LRLanguage.define({
    name: "expr",
    parser: parser.configure({
        props: [
            styleTags({
                Identifier: t.variableName,
                "Property/Identifier": t.propertyName,
                "MemberExpression/Identifier": t.propertyName,
                "PointerExpression/Identifier": t.propertyName,
                Boolean: t.bool,
                String: t.string,
                Number: t.number,
                Nil: t.null,
                LineComment: t.lineComment,
                "( )": t.paren,
                "[ ]": t.squareBracket,
                "{ }": t.brace,
                ".": t.derefOperator,
                ",": t.separator,
                LogicOp: t.logicOperator,
                CompareOp: t.compareOperator,
                ArithOp: t.arithmeticOperator,
                Operator: t.operator,
                '"?"': t.logicOperator,
                '":"': t.punctuation,
            })
        ]
    }),
    languageData: {
        commentTokens: { line: "#" }
    }
});

export function expr() {
    return new LanguageSupport(exprLanguage);
}
