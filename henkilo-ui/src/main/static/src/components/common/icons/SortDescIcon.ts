import "./SortDescIcon.css"
import React from "react"
import SortIconNone from "./SortIconNone"

class SortDescIcon extends React.Component {
    render() {
        return SortIconNone.createSortIcon("oph-sort-desc")
    }
}

export default SortDescIcon