import React from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import OphSelect from "../../select/OphSelect"

class EmailSelect extends React.Component {
    static propTypes = {
        changeEmailAction: PropTypes.func.isRequired,
        emailSelection: PropTypes.string.isRequired,
        emailOptions: PropTypes.array.isRequired,
        l10n: PropTypes.object,
        locale: PropTypes.string,
        henkilo: PropTypes.object,
    }

    constructor(props) {
        super(props)
        this.L = this.props.l10n[this.props.locale]
    }

    render() {
        return (
            <div className="oph-input-container">
                <OphSelect
                    placeholder={this.L["OMATTIEDOT_SAHKOPOSTI_VALINTA"]}
                    options={this.props.emailOptions}
                    value={this.props.emailSelection}
                    onChange={entity =>
                        this.props.changeEmailAction(entity.value)
                    } // onInputChange={this._changeEmailInput.bind(this)}
                    onBlurResetsInput={false}
                    noResultsText={
                        this.L["OMATTIEDOT_HAE_OLEMASSAOLEVA_SAHKOPOSTI"]
                    }
                />
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: state.henkilo,
    }
}

export default connect(mapStateToProps, {})(EmailSelect)