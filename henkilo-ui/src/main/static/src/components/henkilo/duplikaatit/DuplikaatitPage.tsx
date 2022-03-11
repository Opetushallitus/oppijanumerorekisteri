import React from 'react';
import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';
import Loader from '../../common/icons/Loader';
import type { HenkiloState } from '../../../reducers/henkilo.reducer';
import type { KoodistoState } from '../../../reducers/koodisto.reducer';
import type { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    henkiloType: string;
    henkilo: HenkiloState;
    koodisto: KoodistoState;
};

export default class DuplikaatitPage extends React.Component<Props> {
    render() {
        return (
            <div className="wrapper">
                <span className="oph-h2 oph-bold">
                    {this.props.L['DUPLIKAATIT_HEADER']}, {this.props.henkilo.henkilo.kutsumanimi}{' '}
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
