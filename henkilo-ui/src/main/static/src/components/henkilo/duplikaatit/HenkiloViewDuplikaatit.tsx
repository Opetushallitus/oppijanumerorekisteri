import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import './HenkiloViewDuplikaatit.css';
import Button from '../../common/button/Button';
import * as R from 'ramda';
import DuplikaatitPerson from './DuplikaatitPerson';
import Loader from '../../common/icons/Loader';
import { FloatingBar } from './FloatingBar';
import { enabledDuplikaattiView } from '../../navigation/NavigationTabs';
import type { Locale } from '../../../types/locale.type';
import type { Localisations } from '../../../types/localisation.type';
import type { KoodistoState } from '../../../reducers/koodisto.reducer';
import { LocalNotification } from '../../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../../common/Notification/notificationtypes';
import { linkHenkilos, forceLinkHenkilos } from '../../../actions/henkilo.actions';
import type { HenkiloDuplicate, HenkiloDuplicateLenient } from '../../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';
import type { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { Hakemus } from '../../../types/domain/oppijanumerorekisteri/Hakemus.type';

type OwnProps = {
    router?: any;
    oidHenkilo?: string;
    henkilo: HenkiloDuplicateLenient & { hakemukset?: Hakemus[] };
    henkiloType: string;
    removeNotification?: (arg0: string, arg1: string, arg2: string | null | undefined) => void;
    vainLuku: boolean;
};

type StateProps = {
    locale: Locale;
    L: Localisations;
    koodisto: KoodistoState;
    ownOid: string;
    omattiedot: OmattiedotState;
};

type DispatchProps = {
    linkHenkilos: (masterOid: string, slaveOids: Array<string>, successMessage: string, failMessage: string) => void;
    forceLinkHenkilos: (
        masterOid: string,
        slaveOids: Array<string>,
        successMessage: string,
        failMessage: string
    ) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

type State = {
    canForceLink: boolean;
    selectedDuplicates: string[];
    yksiloitySelected: boolean;
};

class HenkiloViewDuplikaatit extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const canForceLink = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, [
            'OPPIJANUMEROREKISTERI_YKSILOINNIN_PURKU',
        ]);

        this.state = {
            canForceLink,
            selectedDuplicates: [],
            yksiloitySelected: canForceLink
                ? false
                : this.props.henkilo.henkilo['yksiloity'] || this.props.henkilo.henkilo['yksiloityVTJ'],
        };
    }

    render() {
        const { henkilo, koodisto, locale, L } = this.props;
        const master: HenkiloDuplicate = henkilo.henkilo;
        master.emails = (henkilo.henkilo.yhteystiedotRyhma || [])
            .flatMap((ryhma) => ryhma.yhteystieto)
            .filter((yhteysTieto) => yhteysTieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
            .map((yhteysTieto) => yhteysTieto.yhteystietoArvo);
        master.hakemukset = henkilo.hakemukset;
        return (
            <div className="duplicates-view">
                <div id="duplicates">
                    <div className="person header">
                        <span />
                        <span />
                        <span>{L['DUPLIKAATIT_HENKILOTUNNUS']}</span>
                        <span>{L['DUPLIKAATIT_YKSILOITY']}</span>
                        <span>{L['DUPLIKAATIT_KUTSUMANIMI']}</span>
                        <span>{L['DUPLIKAATIT_ETUNIMET']}</span>
                        <span>{L['DUPLIKAATIT_SUKUNIMI']}</span>
                        <span>{L['DUPLIKAATIT_SUKUPUOLI']}</span>
                        <span>{L['DUPLIKAATIT_SYNTYMAAIKA']}</span>
                        <span>{L['DUPLIKAATIT_OIDHENKILO']}</span>
                        <span>{L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</span>
                        <span>{L['DUPLIKAATIT_PASSINUMERO']}</span>
                        <span>{L['DUPLIKAATIT_KANSALAISUUS']}</span>
                        <span>{L['DUPLIKAATIT_AIDINKIELI']}</span>
                        <span />
                        <span className="hakemus">{L['DUPLIKAATIT_KANSALAISUUS']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_AIDINKIELI']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_MATKAPUHELINNUMERO']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_SAHKOPOSTIOSOITE']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_OSOITE']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_POSTINUMERO']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_PASSINUMERO']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_KANSALLINENID']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_HAKEMUKSENTILA']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_HAKEMUKSENOID']}</span>
                        <span className="hakemus">{L['DUPLIKAATIT_MUUTHAKEMUKSET']}</span>
                    </div>
                    <DuplikaatitPerson
                        henkilo={master}
                        koodisto={koodisto}
                        L={L}
                        header={'DUPLIKAATIT_HENKILON_TIEDOT'}
                        locale={locale}
                        classNames={{ person: true, master: true }}
                        isMaster={true}
                        vainLuku={this.props.vainLuku}
                        henkiloType={this.props.henkiloType}
                        setSelection={this.setSelection.bind(this)}
                    />
                    {henkilo.duplicates.map((duplicate) => (
                        <DuplikaatitPerson
                            henkilo={duplicate}
                            koodisto={koodisto}
                            L={L}
                            header={'DUPLIKAATIT_DUPLIKAATTI'}
                            locale={locale}
                            key={duplicate.oidHenkilo}
                            isMaster={false}
                            classNames={{ person: true }}
                            vainLuku={this.props.vainLuku}
                            henkiloType={this.props.henkiloType}
                            setSelection={this.setSelection.bind(this)}
                            yksiloitySelected={this.state.yksiloitySelected}
                        ></DuplikaatitPerson>
                    ))}
                    {henkilo.duplicatesLoading ? <Loader /> : null}
                    <LocalNotification
                        title={L['DUPLIKAATIT_NOTIFICATION_EI_LOYTYNYT']}
                        type={NOTIFICATIONTYPES.INFO}
                        toggle={!henkilo.duplicates}
                    ></LocalNotification>
                </div>
                {!this.props.vainLuku && this.props.oidHenkilo && (
                    <FloatingBar>
                        <Button
                            disabled={
                                this.state.selectedDuplicates.length === 0 ||
                                !enabledDuplikaattiView(
                                    this.props.oidHenkilo,
                                    henkilo.kayttaja,
                                    henkilo.masterLoading,
                                    henkilo.master.oidHenkilo
                                ) ||
                                this.props.oidHenkilo === this.props.ownOid
                            }
                            action={this.createLinkAction(this.props.linkHenkilos).bind(this)}
                        >
                            {L['DUPLIKAATIT_YHDISTA']}
                        </Button>
                        {this.state.canForceLink ? (
                            <Button
                                disabled={
                                    this.state.selectedDuplicates.length === 0 ||
                                    !enabledDuplikaattiView(
                                        this.props.oidHenkilo,
                                        this.props.henkilo.kayttaja,
                                        this.props.henkilo.masterLoading,
                                        this.props.henkilo.master.oidHenkilo
                                    ) ||
                                    this.props.oidHenkilo === this.props.ownOid
                                }
                                action={this.createLinkAction(this.props.forceLinkHenkilos).bind(this)}
                            >
                                {this.props.L['DUPLIKAATIT_PURA_YKSILOINNIT_JA_YHDISTA']}
                            </Button>
                        ) : null}
                    </FloatingBar>
                )}
            </div>
        );
    }

    createLinkAction(
        action: (masterOid: string, slaveOids: Array<string>, successMessage: string, failMessage: string) => void
    ) {
        return async () => {
            const successMessage = this.props.L['DUPLIKAATIT_NOTIFICATION_ONNISTUI'];
            const failMessage = this.props.L['DUPLIKAATIT_NOTIFICATION_EPAONNISTUI'];
            const oid = this.props.oidHenkilo ? this.props.oidHenkilo : '';
            await action(oid, this.state.selectedDuplicates, successMessage, failMessage);
            if (this.props.router) {
                this.props.router.push(`/${this.props.henkiloType}/${oid}`);
            }
        };
    }

    setSelection(oid: string) {
        const selectedDuplicates = this.state.selectedDuplicates.includes(oid)
            ? R.reject((duplicateOid) => duplicateOid === oid, this.state.selectedDuplicates)
            : R.append(oid, this.state.selectedDuplicates);
        this.setState({ selectedDuplicates });
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    ownOid: state.omattiedot.data.oid,
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    koodisto: state.koodisto,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    linkHenkilos,
    forceLinkHenkilos: forceLinkHenkilos,
})(HenkiloViewDuplikaatit);
