import React from 'react'
import {connect} from 'react-redux'
import OphSelect from "../../select/OphSelect";

class EmailSelect extends React.Component {
    static propTypes = {
        changeEmailAction: React.PropTypes.func.isRequired,
        emailSelection: React.PropTypes.object.isRequired,

        l10n: React.PropTypes.array,
        locale: React.PropTypes.string,
        henkilo: React.PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this.state = {
            emailOptions: [],
        };
    };

    componentDidMount() {
        this.setState({
            emailOptions: EmailSelect._parseEmailOptions(this.props.henkilo)
        });
    };

    render() {
        return <div className="oph-input-container">
            <OphSelect placeholder={this.L['OMATTIEDOT_SAHKOPOSTI_VALINTA']}
                       options={this.state.emailOptions}
                       value={this.props.emailSelection}
                       onChange={this.props.changeEmailAction}
                       // onInputChange={this._changeEmailInput.bind(this)}
                       onBlurResetsInput={false}
                       onInputKeyDown={this._changeEmailEnterKey.bind(this)}
                       noResultsText={this.L['OMATTIEDOT_KIRJOITA_SAHKOPOSTI']}
            />
        </div>;
    };

    static _parseEmailOptions(henkilo) {
        let emails = [];
        henkilo.henkilo.yhteystiedotRyhma.forEach(yhteystietoRyhma => {
            yhteystietoRyhma.yhteystieto.forEach(yhteys => {
                if (yhteys.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI') {
                    emails.push(yhteys.yhteystietoArvo);
                }
            })
        });
        return emails.map(email => ({value: email, label: email}));
    };

    _changeEmailEnterKey(event) {
        if (event.keyCode === 13) {
            const emailOptions = this.state.emailOptions;
            const newEmail = event.target.value;
            emailOptions.push({value: newEmail, label: newEmail});
            this.setState({emailOptions: emailOptions,});
            this.props.changeEmailAction(newEmail.value);
        }
    };

}

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: state.henkilo,
    };
};

export default connect(mapStateToProps, {})(EmailSelect);