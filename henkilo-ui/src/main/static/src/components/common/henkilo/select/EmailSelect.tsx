import React from 'react';
import { connect } from 'react-redux';
import OphSelect from '../../select/OphSelect';

type Props = {
    changeEmailAction: (entity: any) => void;
    emailSelection: string;
    emailOptions: string[];
    l10n: Record<string, Record<string, string>>;
    locale: string;
    henkilo: {};
};

class EmailSelect extends React.Component<Props> {
    L;

    constructor(props) {
        super(props);
        this.L = this.props.l10n[this.props.locale];
    }

    render() {
        return (
            <div className="oph-input-container">
                <OphSelect
                    placeholder={this.L['OMATTIEDOT_SAHKOPOSTI_VALINTA']}
                    options={this.props.emailOptions}
                    value={this.props.emailSelection}
                    onChange={(entity) => this.props.changeEmailAction(entity.value)} // onInputChange={this._changeEmailInput.bind(this)}
                    onBlurResetsInput={false}
                    noResultsText={this.L['OMATTIEDOT_HAE_OLEMASSAOLEVA_SAHKOPOSTI']}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: state.henkilo,
    };
};

export default connect(mapStateToProps, {})(EmailSelect);
