import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";
import { parser } from "./expr.js";

/**
 * Defines the CodeMirror language support for the 'expr' language.
 * Connects the Lezer parser with CodeMirror's highlighting tags.
 */
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

/**
 * Returns a LanguageSupport instance for the 'expr' language.
 * This can be used as an extension in CodeMirror.
 * 
 * @returns The language support extension for CodeMirror.
 */
export function expr() {
    return new LanguageSupport(exprLanguage);
}
