import React from 'react';
import { Localisations } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import { HenkiloCreate } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { HenkiloDuplicate } from '../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import HenkiloViewDuplikaatit from '../../components/henkilo/duplikaatit/HenkiloViewDuplikaatit';

type OppijaCreateDuplikaatitProps = {
    locale: Locale;
    L: Localisations;
    tallenna: (oppija: HenkiloCreate) => any;
    peruuta: () => any;
    oppija: HenkiloCreate;
    duplikaatit: Array<HenkiloDuplicate>;
};

/**
 * Oppijoiden luonnissa näytettävät duplikaattihenkilöt.
 */
class OppijaCreateDuplikaatit extends React.Component<OppijaCreateDuplikaatitProps> {
    render() {
        const henkilo = {
            henkilo: {
                ...this.props.oppija,
            },
            duplicates: this.props.duplikaatit,
        };
        const notifications = [];

        return (
            <div>
                <div className="oph-field">{this.props.L['OPPIJAN_LUONTI_DUPLIKAATIT_OHJE']}</div>
                <HenkiloViewDuplikaatit
                    henkilo={henkilo}
                    notifications={notifications}
                    vainLuku={true}
                    henkiloType="oppija"
                />
                <div className="oph-field">
                    <button type="button" className="oph-button oph-button-primary" onClick={this.tallenna}>
                        {this.props.L['OPPIJAN_LUONTI_LUO_NAPPI']}
                    </button>
                    <button type="button" className="oph-button oph-button-cancel" onClick={this.peruuta}>
                        {this.props.L['PERUUTA']}
                    </button>
                </div>
            </div>
        );
    }

    tallenna = () => {
        this.props.tallenna(this.props.oppija);
    };

    peruuta = () => {
        this.props.peruuta();
    };
}

export default OppijaCreateDuplikaatit;
