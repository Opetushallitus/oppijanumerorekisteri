import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import OphSelect from './OphSelect';
import type { OnChangeHandler, Options, Option } from 'react-select';
import StaticUtils from '../StaticUtils';
import { fetchAllKayttooikeusryhma } from '../../../actions/kayttooikeusryhma.actions';
import { Localisations } from '../../../types/localisation.type';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { Locale } from '../../../types/locale.type';

type OwnProps = {
    kayttooikeusSelectionAction: OnChangeHandler<string, Options<string> | Option<string>>;
    kayttooikeusSelection?: string;
};

type StateProps = {
    L: Localisations;
    locale: Locale;
    kayttooikeusRyhmas: Array<Kayttooikeusryhma>;
    kayttooikeusLoading: boolean;
};

type DispatchProps = {
    fetchAllKayttooikeusryhma: (forceFetch: boolean) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

type State = {
    selectedKayttooikeus: number | null | undefined;
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
        };
    }

    render() {
        return !this.props.kayttooikeusLoading &&
            this.props.kayttooikeusRyhmas &&
            this.props.kayttooikeusRyhmas.length ? (
            <OphSelect
                id="kayttooikeusryhmaFilter"
                options={this.props.kayttooikeusRyhmas
                    .filter((kayttooikeusryhma) => !kayttooikeusryhma.passivoitu)
                    .map((kayttooikeusryhma) => ({
                        value: '' + kayttooikeusryhma.id,
                        label: StaticUtils.getLocalisedText(kayttooikeusryhma.description, this.props.locale),
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))}
                value={`${this.props.kayttooikeusSelection}`}
                placeholder={this.props.L['HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER']}
                onChange={(event) => this.props.kayttooikeusSelectionAction(event)}
            />
        ) : null;
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    kayttooikeusLoading: state.kayttooikeus.allKayttooikeusryhmasLoading,
    kayttooikeusRyhmas: state.kayttooikeus.allKayttooikeusryhmas,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    fetchAllKayttooikeusryhma,
})(KayttooikeusryhmaSingleSelect);
