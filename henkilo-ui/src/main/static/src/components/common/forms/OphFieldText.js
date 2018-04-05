// @flow
import * as React from 'react'
import classNames from 'classnames'

type Props = {
    hasError?: boolean,
    children: React.Node,
}

class OphFieldText extends React.Component<Props> {

    render() {
        const classes = classNames({
            'oph-field-text': true,
            'oph-error': this.props.hasError,
        })
        return (
            <div className={classes}>
                {this.props.children}
            </div>
        )
    }

}

export default OphFieldText
