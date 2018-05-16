// @flow
import React from 'react';
import LabelValue from "./LabelValue";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {Henkilo} from "../../../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {L} from "../../../../types/localisation.type";
import {connect} from "react-redux";

type Props = {
    updateModelFieldAction: (string) => void,
    henkilo: HenkiloState,
    readOnly?: boolean,
    henkiloUpdate: Henkilo,
    L: L
}

class AnomusIlmoitus extends React.Component<Props> {

    render() {
        return <LabelValue updateModelFieldAction={this.props.updateModelFieldAction}
                           values={{
                                label: 'HENKILO_ANOMUSILMOITUKSET',
                                value: this.props.henkilo.henkilo.anomusIlmoitus === 'true' ? this.props.L['HENKILO_YHTEISET_KYLLA'] : this.props.L['HENKILO_YHTEISET_EI'],
                                inputValue: 'anomusIlmoitus',
                                readOnly: this.props.readOnly,
                                selectValue: this.props.henkiloUpdate.anomusIlmoitus === 'true' ? 'true' : 'false',
                                data: [{
                                    value: 'false',
                                    label: this.props.L['HENKILO_YHTEISET_EI'],
                                    optionsName: 'anomusIlmoitus'
                                }, {
                                    value: 'true',
                                    label: this.props.L['HENKILO_YHTEISET_KYLLA'],
                                    optionsName: 'anomusIlmoitus'
                                }]
                           }}

                ></LabelValue>
    }

}

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale]
});

export default connect(mapStateToProps, {})(AnomusIlmoitus)