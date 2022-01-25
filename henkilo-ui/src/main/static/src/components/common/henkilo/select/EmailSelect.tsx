import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import type { Localisations } from '../../../../types/localisation.type';
import OphSelect from '../../select/OphSelect';

type OwnProps = {
    changeEmailAction: (entity: any) => void;
    emailSelection: string;
    emailOptions: { value: string; label: string }[];
};

type StateProps = {
    L: Localisations;
    henkilo: HenkiloState;
};

type Props = OwnProps & StateProps;

class EmailSelect extends React.Component<Props> {
    render() {
        return (
            <div className="oph-input-container">
                <OphSelect
                    placeholder={this.props.L['OMATTIEDOT_SAHKOPOSTI_VALINTA']}
                    options={this.props.emailOptions}
                    value={this.props.emailSelection}
                    onChange={(entity) => this.props.changeEmailAction(entity.value)} // onInputChange={this._changeEmailInput.bind(this)}
                    onBlurResetsInput={false}
                    noResultsText={this.props.L['OMATTIEDOT_HAE_OLEMASSAOLEVA_SAHKOPOSTI']}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        L: state.l10n.localisations[state.locale],
        henkilo: state.henkilo,
    };
};

export default connect(mapStateToProps, {})(EmailSelect);
