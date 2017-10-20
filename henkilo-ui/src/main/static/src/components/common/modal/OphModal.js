// @flow
import * as React from 'react'

type Props = {
    children: React.Node,
    title?: string,
    onClose: (SyntheticEvent<HTMLButtonElement>) => void,
}

/**
 * Tyylioppaan mukainen modal.
 */
class OphModal extends React.Component<Props> {

    render() {
        return (
            <div className="oph-overlay oph-overlay-bg oph-overlay-is-visible" role="dialog" tabIndex="-1">
                <div className="oph-modal" role="document">
                    <button className="oph-button oph-button-close" type="button" title="Close" aria-label="Close" onClick={this.props.onClose}>
                        <span aria-hidden="true">×</span>
                    </button>

                    <div className="oph-modal-content">
                        {this.props.title &&
                            <h1 className="oph-modal-title">{this.props.title}</h1>
                        }
                        {this.props.children}
                    </div>

                    <a className="oph-link oph-modal-back-to-top-link" href="#modal">
                        Back to modal top
                    </a>
                </div>
            </div>
        )

    }
}

export default OphModal
