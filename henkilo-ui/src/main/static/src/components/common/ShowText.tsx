import React from "react"

export const ShowText = props => {
    return <span>{props.show ? props.children : ""}</span>
}