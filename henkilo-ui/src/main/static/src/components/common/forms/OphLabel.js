// @flow
import * as React from 'react'
import classNames from 'classnames'

type Props = {
    for?: string,
    children: React.Node,
}

class OphLabel extends React.Component<Props> {

    render() {
        const classes = classNames({
            'oph-label': true,
        })
        return (
            <label className={classes} htmlFor={this.props.for}>
                {this.props.children}
            </label>
        )
    }

}

export default OphLabel
