import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import type { Localisations } from '../../../../types/localisation.type';
import OphSelect from '../../select/OphSelect';
import type { OnChangeHandler, Options, Option } from 'react-select';

type OwnProps = {
    changeEmailAction: OnChangeHandler<string, Options<string> | Option<string>>;
    emailSelection: string;
    emailOptions: Options<string>;
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
                    onChange={(entity) => this.props.changeEmailAction(entity)}
                    onBlurResetsInput={false}
                    noResultsText={this.props.L['OMATTIEDOT_HAE_OLEMASSAOLEVA_SAHKOPOSTI']}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect<StateProps, {}, {}, RootState>(mapStateToProps)(EmailSelect);
