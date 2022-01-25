import React from 'react';
import { urls } from 'oph-urls-js';
import { http } from '../../../../http';
import LabelValue from './LabelValue';
import { Localisations } from '../../../../types/localisation.type';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import { OmattiedotState } from '../../../../reducers/omattiedot.reducer';
import { Kayttooikeusryhma } from '../../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { localizeTextGroup } from '../../../../utilities/localisation.util';
import { Locale } from '../../../../types/locale.type';

type OwnProps = {
    updateModelFieldAction: (arg0: { value: Array<number>; optionsName: string }) => void;
    omattiedot: OmattiedotState;
    readOnly?: boolean;
    henkiloUpdate: any;
};

type StateProps = {
    L: Localisations;
    locale: Locale;
};
type Props = OwnProps & StateProps;

type State = {
    vastuukayttajaRyhmat: Array<Kayttooikeusryhma>;
};

class AnomusIlmoitus extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            vastuukayttajaRyhmat: [],
        };
    }

    async componentDidMount() {
        const vastuukayttajaRyhmat = await this.fetchVastuukayttajaRyhmat();
        this.setState({ vastuukayttajaRyhmat });
    }

    render() {
        return (
            <LabelValue
                updateModelFieldAction={(tilaukset: Array<{ value: number }>) => {
                    tilaukset &&
                        this.props.updateModelFieldAction({
                            optionsName: 'anomusilmoitus',
                            value: [...tilaukset.map((tilaus) => tilaus.value)],
                        });
                }}
                values={{
                    label: 'HENKILO_ANOMUSILMOITUKSET',
                    inputValue: 'anomusilmoitus',
                    readOnly: this.props.readOnly,
                    selectValue: this.props.henkiloUpdate.anomusilmoitus,
                    data: this.state.vastuukayttajaRyhmat.map((vastuukayttajaRyhma) => ({
                        value: vastuukayttajaRyhma.id,
                        label: localizeTextGroup(vastuukayttajaRyhma.nimi.texts, this.props.locale),
                        optionsName: 'anomusilmoitus',
                    })),
                    multiselect: true,
                }}
            />
        );
    }

    async fetchVastuukayttajaRyhmat() {
        const url = urls.url('kayttooikeus-service.kayttooikeusryhma.by-kayttooiokeus');
        const vastuukayttajat: Array<Kayttooikeusryhma> = await http.post(url, {
            KAYTTOOIKEUS: 'VASTUUKAYTTAJAT',
        });
        return vastuukayttajat;
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
});

export default connect<StateProps>(mapStateToProps)(AnomusIlmoitus);
