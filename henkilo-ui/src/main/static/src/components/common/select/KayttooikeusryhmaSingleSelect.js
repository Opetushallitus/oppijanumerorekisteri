// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import OphSelect from "./OphSelect";
import StaticUtils from "../StaticUtils";
import {fetchAllKayttooikeusryhma} from '../../../actions/kayttooikeusryhma.actions';
import type {L} from "../../../types/localisation.type";

type Props = {
    L: L,
    locale: string,
    fetchAllKayttooikeusryhma: (boolean) => void,
    kayttooikeusRyhmas: Array<{id: number, description: {texts: Array<{lang: string, text: string}>}}>,
    kayttooikeusSelectionAction: (number) => void,
    kayttooikeusSelection: ?number,
    kayttooikeusLoading: boolean
};

type State = {
    selectedKayttooikeus: ?number,
};

class KayttooikeusryhmaSingleSelect extends React.Component<Props, State> {
    static propTypes = {
        kayttooikeusSelectionAction: PropTypes.func.isRequired,
    };

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
                         options={this.props.kayttooikeusRyhmas.map(kayttooikeusryhma => ({
                             value: kayttooikeusryhma.id,
                             label: StaticUtils.getLocalisedText(kayttooikeusryhma.description.texts, this.props.locale)
                         }))}
                         value={this.props.kayttooikeusSelection}
                         placeholder={this.props.L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                         onChange={(event) => this.props.kayttooikeusSelectionAction(event.value)}/>
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
