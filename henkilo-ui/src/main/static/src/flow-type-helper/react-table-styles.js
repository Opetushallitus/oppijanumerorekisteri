// https://github.com/facebook/flow/issues/2092

// Fix flow compile for css-files in node_modules (that has been ignored in .flowconfig)

declare module 'react-table/react-table.css' {
    declare module.exports: any
}