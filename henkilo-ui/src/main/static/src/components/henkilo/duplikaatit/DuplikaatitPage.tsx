import React from 'react';
import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';
import Loader from '../../common/icons/Loader';
import { L10n } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { KoodistoState } from '../../../reducers/koodisto.reducer';

type Props = {
    l10n: L10n;
    locale: Locale;
    henkiloType: string;
    henkilo: HenkiloState;
    koodisto: KoodistoState;
};

export default class DuplikaatitPage extends React.Component<Props> {
    render() {
        const L = this.props.l10n[this.props.locale];
        return (
            <div className="wrapper">
                <span className="oph-h2 oph-bold">
                    {L['DUPLIKAATIT_HEADER']}, {this.props.henkilo.henkilo.kutsumanimi}{' '}
                    {this.props.henkilo.henkilo.sukunimi}
                </span>
                {!this.props.henkilo.henkiloLoading && !this.props.henkilo.hakemuksetLoading ? (
                    <HenkiloViewDuplikaatit {...this.props} vainLuku={false} />
                ) : (
                    <Loader />
                )}
            </div>
        );
    }
}
