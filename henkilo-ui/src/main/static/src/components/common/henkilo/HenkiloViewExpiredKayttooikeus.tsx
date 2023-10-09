import * as React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../store';
import Table from '../table/Table';
import moment from 'moment';
import StaticUtils from '../StaticUtils';
import { toLocalizedText } from '../../../localizabletext';
import { Localisations, L10n } from '../../../types/localisation.type';
import { Locale } from '../../../types/locale.type';
import { TableCellProps, TableHeading } from '../../../types/react-table.types';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import HaeJatkoaikaaButton from '../../omattiedot/HaeJatkoaikaaButton';
import { path } from 'ramda';
import { EmailOption } from '../../../types/emailoption.type';
import { createEmailOptions } from '../../../utilities/henkilo.util';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import {
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo,
} from '../../../actions/kayttooikeusryhma.actions';
import { MyonnettyKayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { OmattiedotState } from '../../../reducers/omattiedot.reducer';
import { KAYTTOOIKEUDENTILA } from '../../../globals/KayttooikeudenTila';
import AccessRightDetails, { AccessRight, AccessRightDetaisLink } from './AccessRightDetails';
import { localizeTextGroup } from '../../../utilities/localisation.util';
import { OrganisaatioCache } from '../../../reducers/organisaatio.reducer';

type OwnProps = {
    isOmattiedot: boolean;
    oidHenkilo: string;
};

type StateProps = {
    l10n: L10n;
    locale: Locale;
    organisaatioCache: OrganisaatioCache;
    kayttooikeus: KayttooikeusRyhmaState;
    henkilo: HenkiloState;
    omattiedot: OmattiedotState;
};

type DispatchProps = {
    createKayttooikeusanomus: (anousData: any) => void;
    fetchAllKayttooikeusAnomusForHenkilo: (arg0: string) => void;
};

type Props = OwnProps & DispatchProps & StateProps;

type State = {
    emailOptions: Array<EmailOption>;
    emailSelection: Record<number, EmailOption>;
    missingEmail: boolean;
    showMissingEmailNotification: boolean;
    accessRight: AccessRight | null;
};

class HenkiloViewExpiredKayttooikeus extends React.Component<Props, State> {
    L: Localisations;
    tableHeadings: Array<TableHeading>;
    _rows: Array<any>;

    constructor(props: Props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        const headingList = [
            { key: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO' },
            {
                key: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
                Cell: (cellProps: TableCellProps) => (
                    <AccessRightDetaisLink
                        cellProps={cellProps}
                        clickHandler={(kayttooikeusRyhma) => this.showAccessRightGroupDetails(kayttooikeusRyhma)}
                    />
                ),
            },
            { key: 'HENKILO_KAYTTOOIKEUS_TILA' },
            {
                key: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
                minWidth: 150,
                Cell: (cellProps) => cellProps.value.kasitelty.format() + ' / ' + cellProps.value.kasittelija,
                sortMethod: (a, b) => {
                    const kasiteltyCompare = a.kasitelty.valueOf() - b.kasitelty.valueOf();
                    if (kasiteltyCompare !== 0) {
                        return kasiteltyCompare;
                    }
                    return a.kasittelija.localeCompare(b.kasittelija);
                },
            },
            {
                key: 'HENKILO_ANO_KAYTTOOIKEUDELLE_JATKOA',
                notSortable: true,
                hide: !this.props.isOmattiedot,
            },
        ];
        this.tableHeadings = headingList.map((heading) => ({
            ...heading,
            label: this.L[heading.key],
        }));

        this.state = {
            ...createEmailOptions(
                this.props.henkilo,
                this._filterExistingKayttooikeus,
                this.props.kayttooikeus.kayttooikeus
            ),
            accessRight: null,
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        this.setState({
            ...createEmailOptions(
                nextProps.henkilo,
                this._filterExistingKayttooikeus,
                nextProps.kayttooikeus.kayttooikeus
            ),
        });
    }

    createRows(headingList: Array<string>) {
        this._rows = this.props.kayttooikeus.kayttooikeus
            .filter(this._filterExistingKayttooikeus)
            .map((vanhentunutKayttooikeus: MyonnettyKayttooikeusryhma) => ({
                kayttooikeusRyhma: vanhentunutKayttooikeus,
                [headingList[0]]: toLocalizedText(
                    this.props.locale,
                    (
                        this.props.organisaatioCache[vanhentunutKayttooikeus.organisaatioOid] ||
                        StaticUtils.defaultOrganisaatio(vanhentunutKayttooikeus.organisaatioOid, this.props.l10n)
                    ).nimi
                ),
                [headingList[1]]: vanhentunutKayttooikeus.ryhmaNames?.texts.filter(
                    (text) => text.lang === this.props.locale.toUpperCase()
                )[0].text,
                [headingList[2]]: this.L[vanhentunutKayttooikeus.tila],
                [headingList[3]]: {
                    kasitelty: moment(vanhentunutKayttooikeus.kasitelty),
                    kasittelija: vanhentunutKayttooikeus.kasittelijaNimi || vanhentunutKayttooikeus.kasittelijaOid,
                },
                [headingList[4]]: vanhentunutKayttooikeus.tila === KAYTTOOIKEUDENTILA.VANHENTUNUT &&
                    !this.hideVanhentunutKayttooikeusUusintaButton(vanhentunutKayttooikeus) && (
                        <div>
                            {this.createEmailSelectionIfMoreThanOne(vanhentunutKayttooikeus.ryhmaId)}
                            <HaeJatkoaikaaButton
                                haeJatkoaikaaAction={() => this._createKayttooikeusAnomus(vanhentunutKayttooikeus)}
                                disabled={this.isHaeJatkoaikaaButtonDisabled(
                                    vanhentunutKayttooikeus.ryhmaId,
                                    vanhentunutKayttooikeus
                                )}
                            />
                        </div>
                    ),
            }));
    }

    showAccessRightGroupDetails(kayttooikeusRyhma: MyonnettyKayttooikeusryhma) {
        const accessRight: AccessRight = {
            name: localizeTextGroup(kayttooikeusRyhma.ryhmaNames.texts, this.props.locale),
            description: localizeTextGroup(
                [...(kayttooikeusRyhma.ryhmaKuvaus?.texts || []), ...kayttooikeusRyhma.ryhmaNames.texts],
                this.props.locale
            ),
            onClose: () => this.setState(() => ({ accessRight: null })),
        };
        this.setState(() => ({ accessRight }));
    }

    render() {
        this.createRows(this.tableHeadings.map((heading) => heading.key));
        return (
            <div className="henkiloViewUserContentWrapper">
                {this.state.accessRight && <AccessRightDetails {...this.state.accessRight} />}
                <div>
                    <div className="header">
                        <p className="oph-h2 oph-bold">{this.L['HENKILO_VANHAT_KAYTTOOIKEUDET_OTSIKKO']}</p>
                    </div>
                    <div>
                        <Table
                            getTdProps={() => ({ style: { textOverflow: 'unset' } })}
                            headings={this.tableHeadings}
                            data={this._rows}
                            noDataText={this.L['HENKILO_KAYTTOOIKEUS_SULKEUTUNEET_TYHJA']}
                        />
                    </div>
                </div>
            </div>
        );
    }

    createEmailSelectionIfMoreThanOne(ryhmaId: number): React.ReactNode {
        return this.state.emailOptions.length > 1
            ? this.state.emailOptions.map((email, idx2) => (
                  <div key={idx2}>
                      <input
                          type="radio"
                          checked={this.state.emailSelection[ryhmaId].value === email.value}
                          onChange={() =>
                              this.setState({
                                  emailSelection: { ...this.state.emailSelection, [ryhmaId]: email },
                              })
                          }
                      />
                      <span>{email.value}</span>
                  </div>
              ))
            : null;
    }

    _filterExistingKayttooikeus(kayttooikeus: MyonnettyKayttooikeusryhma) {
        return (
            kayttooikeus.tila === KAYTTOOIKEUDENTILA.SULJETTU || kayttooikeus.tila === KAYTTOOIKEUDENTILA.VANHENTUNUT
        );
    }

    async _createKayttooikeusAnomus(kayttooikeusryhma: MyonnettyKayttooikeusryhma) {
        const kayttooikeusRyhmaIds = [kayttooikeusryhma.ryhmaId];
        const anomusData = {
            organisaatioOrRyhmaOid: kayttooikeusryhma.organisaatioOid,
            email: this.state.emailSelection[kayttooikeusryhma.ryhmaId].value,
            perustelut: 'Uusiminen',
            kayttooikeusRyhmaIds,
            anojaOid: this.props.oidHenkilo,
        };
        await this.props.createKayttooikeusanomus(anomusData);
        const oid = path(['omattiedot', 'data', 'oid'], this.props);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid);
    }

    hideVanhentunutKayttooikeusUusintaButton(vanhentunutKayttooikeus: MyonnettyKayttooikeusryhma) {
        // palauttaa true jos vanhentunutKayttooikeus löytyy myös voimassaolevista käyttöoikeuksista
        return !!this.props.kayttooikeus.kayttooikeus
            .filter(
                (kayttooikeus: MyonnettyKayttooikeusryhma) =>
                    kayttooikeus.tila !== KAYTTOOIKEUDENTILA.SULJETTU &&
                    kayttooikeus.tila !== KAYTTOOIKEUDENTILA.VANHENTUNUT
            )
            .reduce((previous: boolean, current: MyonnettyKayttooikeusryhma) => {
                return (
                    previous ||
                    (current.organisaatioOid === vanhentunutKayttooikeus.organisaatioOid &&
                        current.ryhmaId === vanhentunutKayttooikeus.ryhmaId)
                );
            }, false);
    }

    isHaeJatkoaikaaButtonDisabled(ryhmaId: number, vanhentunutKayttooikeusryhma: MyonnettyKayttooikeusryhma) {
        const anomusAlreadyExists = !!this.props.kayttooikeus.kayttooikeusAnomus.filter(
            (haettuKayttooikeusRyhma) =>
                haettuKayttooikeusRyhma.kayttoOikeusRyhma.id === vanhentunutKayttooikeusryhma.ryhmaId &&
                vanhentunutKayttooikeusryhma.organisaatioOid === haettuKayttooikeusRyhma.anomus.organisaatioOid
        )[0];
        return (
            this.state.emailSelection[ryhmaId].value === '' ||
            this.state.emailOptions.length === 0 ||
            anomusAlreadyExists
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    l10n: state.l10n.localisations,
    locale: state.locale,
    organisaatioCache: state.organisaatio.cached,
    kayttooikeus: state.kayttooikeus,
    henkilo: state.henkilo,
    omattiedot: state.omattiedot,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    createKayttooikeusanomus,
    fetchAllKayttooikeusAnomusForHenkilo,
})(HenkiloViewExpiredKayttooikeus);
