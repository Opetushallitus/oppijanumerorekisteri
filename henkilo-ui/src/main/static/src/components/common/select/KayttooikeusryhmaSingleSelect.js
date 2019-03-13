// @flow
import React from 'react';
import {connect} from 'react-redux';
import OphSelect from "./OphSelect";
import StaticUtils from "../StaticUtils";
import {fetchAllKayttooikeusryhma} from '../../../actions/kayttooikeusryhma.actions';
import type {Localisations} from "../../../types/localisation.type";
import type {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";

type Props = {
    L: Localisations,
    locale: string,
    fetchAllKayttooikeusryhma: (boolean) => void,
    kayttooikeusRyhmas: Array<Kayttooikeusryhma>,
    kayttooikeusSelectionAction: (number) => void,
    kayttooikeusSelection: ?number,
    kayttooikeusLoading: boolean
};

type State = {
    selectedKayttooikeus: ?number,
};

class KayttooikeusryhmaSingleSelect extends React.Component<Props, State> {

    componentDidMount() {
        // Fetches only if not already fetched
        this.props.fetchAllKayttooikeusryhma(false);
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            selectedKayttooikeus: null,
        }
    }

    render() {
        return !this.props.kayttooikeusLoading && this.props.kayttooikeusRyhmas && this.props.kayttooikeusRyhmas.length
            ? <OphSelect id="kayttooikeusryhmaFilter"
                         options={this.props.kayttooikeusRyhmas.filter(kayttooikeusryhma => !kayttooikeusryhma.passivoitu)
                             .map(kayttooikeusryhma => ({
                                 value: kayttooikeusryhma.id,
                                 label: StaticUtils.getLocalisedText(kayttooikeusryhma.description, this.props.locale)
                             })).sort((a,b) => a.label.localeCompare(b.label))}
                         value={this.props.kayttooikeusSelection}
                         placeholder={this.props.L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                         onChange={(event) => this.props.kayttooikeusSelectionAction(event.value)}
            />
            : null;
    }

}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    kayttooikeusLoading: state.kayttooikeus.allKayttooikeusryhmasLoading,
    kayttooikeusRyhmas: state.kayttooikeus.allKayttooikeusryhmas,
});

export default connect(mapStateToProps, {fetchAllKayttooikeusryhma})(KayttooikeusryhmaSingleSelect);
