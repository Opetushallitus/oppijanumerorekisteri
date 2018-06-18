// @flow
import React from 'react';
import LabelValue from "./LabelValue";
import type {L} from "../../../../types/localisation.type";
import {connect} from "react-redux";
import type {OmattiedotState} from "../../../../reducers/omattiedot.reducer";

type Props = {
    updateModelFieldAction: (string) => void,
    omattiedot: OmattiedotState,
    readOnly?: boolean,
    henkiloUpdate: any,
    L: L
}

class AnomusIlmoitus extends React.Component<Props> {

    render() {

        return <LabelValue updateModelFieldAction={this.props.updateModelFieldAction}
                           values={{
                                label: 'HENKILO_ANOMUSILMOITUKSET',
                                inputValue: 'anomusilmoitus',
                                readOnly: this.props.readOnly,
                                selectValue: this.props.henkiloUpdate.anomusilmoitus,
                                data: [{
                                    value: false,
                                    label: this.props.L['HENKILO_YHTEISET_EI'],
                                    optionsName: 'anomusilmoitus'
                                }, {
                                    value: true,
                                    label: this.props.L['HENKILO_YHTEISET_KYLLA'],
                                    optionsName: 'anomusilmoitus'
                                }]
                           }}

                ></LabelValue>
    }

}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(AnomusIlmoitus)