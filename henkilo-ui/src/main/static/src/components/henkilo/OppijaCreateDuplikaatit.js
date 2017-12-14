// @flow
import React from 'react'
import type { L } from '../../types/localisation.type'
import type { Locale } from '../../types/locale.type'
import type { HenkiloCreate } from '../../types/domain/oppijanumerorekisteri/henkilo.types'
import type { HenkiloDuplicate } from '../../types/domain/oppijanumerorekisteri/HenkiloDuplicate'
import HenkiloViewDuplikaatit from '../../components/henkilo/duplikaatit/HenkiloViewDuplikaatit'

type Props = {
    locale: Locale,
    L: L,
    tallenna: (oppija: HenkiloCreate) => any,
    peruuta: () => any,
    oppija: HenkiloCreate,
    duplikaatit: Array<HenkiloDuplicate>,
}

/**
 * Oppijoiden luonnissa näytettävät duplikaattihenkilöt.
 */
class OppijaCreateDuplikaatit extends React.Component<Props> {

    render() {
        const henkilo = {
            henkilo: this.props.oppija,
            duplicates: this.props.duplikaatit,
        };
        const notifications = [];

        return (
            <div>
                <div className="oph-field">
                    {this.props.L['OPPIJAN_LUONTI_DUPLIKAATIT_OHJE']}
                </div>
                <HenkiloViewDuplikaatit
                    henkilo={henkilo}
                    notifications={notifications}
                    vainLuku={true}
                />
                <div className="oph-field">
                    <button type="button"
                        className="oph-button oph-button-primary"
                        onClick={this.tallenna}>
                        {this.props.L['OPPIJAN_LUONTI_LUO_NAPPI']}
                    </button>
                    <button type="button"
                        className="oph-button oph-button-cancel"
                        onClick={this.peruuta}>
                        {this.props.L['PERUUTA']}
                    </button>
                </div>
            </div>
        )
    }

    tallenna = (event: SyntheticEvent<HTMLButtonElement>) => {
        this.props.tallenna(this.props.oppija)
    };

    peruuta = (event: SyntheticEvent<HTMLButtonElement>) => {
        this.props.peruuta()
    }

}

export default OppijaCreateDuplikaatit
