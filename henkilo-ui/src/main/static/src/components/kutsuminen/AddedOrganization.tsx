import React from 'react';
import { connect } from 'react-redux';
import * as R from 'ramda';
import './AddedOrganization.css';
import {
    kutsuAddOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    kutsuSetOrganisaatio,
    kutsuOrganisaatioSetProperties,
    addOrganisaatioPermission,
    removeOrganisaatioPermission,
} from '../../actions/kutsuminen.actions';
import { toLocalizedText } from '../../localizabletext';
import RyhmaSelection from '../common/select/RyhmaSelection';
import {
    findOmattiedotOrganisatioOrRyhmaByOid,
    omattiedotOrganisaatiotToOrganisaatioSelectObject,
} from '../../utilities/organisaatio.util';
import { KutsuOrganisaatio, OrganisaatioHenkilo } from '../../types/domain/kayttooikeus/OrganisaatioHenkilo.types';
import { Localisations } from '../../types/localisation.type';
import KayttooikeusryhmaSelectModal from '../common/select/KayttooikeusryhmaSelectModal';
import { myonnettyToKayttooikeusryhma } from '../../utils/KayttooikeusryhmaUtils';
import { Kayttooikeusryhma, MyonnettyKayttooikeusryhma } from '../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { OrganisaatioSelectModal } from '../common/select/OrganisaatioSelectModal';
import SimpleDatePicker from '../henkilo/SimpleDatePicker';
import moment from 'moment';
import { fetchAllowedKayttooikeusryhmasForOrganisation } from '../../actions/kayttooikeusryhma.actions';
import { OrganisaatioSelectObject } from '../../types/organisaatioselectobject.types';
import CrossCircleIcon from '../common/icons/CrossCircleIcon';

type OwnProps = {
    addedOrgs: Array<KutsuOrganisaatio>;
    addedOrg: KutsuOrganisaatio;
    index: number;
};

type Props = OwnProps & {
    locale: string;
    L: Localisations;
    omatOrganisaatios: Array<OrganisaatioHenkilo>;
    kutsuRemoveOrganisaatio: (arg0: number) => void;
    kutsuSetOrganisaatio: (arg0: number, arg1: OrganisaatioSelectObject | null | undefined) => void;
    fetchAllowedKayttooikeusryhmasForOrganisation: (arg0: string, arg1: string) => void;
    currentHenkiloOid: string;
    addOrganisaatioPermission: (arg0: string, arg1: MyonnettyKayttooikeusryhma | null | undefined) => void;
    removeOrganisaatioPermission: (arg0: string, arg1: MyonnettyKayttooikeusryhma) => void;
    kutsuOrganisaatioSetProperties: (
        index: number,
        arg1: {
            [key: string]: any;
        }
    ) => void;
    ryhmatState: any;
};

type State = {
    organisaatioSelection: string;
};

class AddedOrganization extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            organisaatioSelection: '',
        };
    }

    render() {
        const addedOrg = this.props.addedOrg;
        const selectedOrganisaatioOid = this.props.addedOrg.organisation ? this.props.addedOrg.organisation.oid : '';
        const selectablePermissions: Array<MyonnettyKayttooikeusryhma> = R.difference(
            addedOrg.selectablePermissions,
            addedOrg.selectedPermissions
        );
        const kayttooikeusryhmat = selectablePermissions.map(myonnettyToKayttooikeusryhma);

        return (
            <div className="added-org" key={addedOrg.key}>
                <div className="row">
                    <div className="flex-horizontal" style={{ justifyContent: 'space-between' }}>
                        <label htmlFor="org">{this.props.L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}</label>
                        <div
                            style={{ paddingTop: '20px', fontSize: '1.5em' }}
                            onClick={() => this.props.kutsuRemoveOrganisaatio(this.props.index)}
                        >
                            <CrossCircleIcon />
                        </div>
                    </div>
                    <div className="flex-horizontal">
                        <input
                            className="oph-input flex-item-1 kutsuminen-organisaatiosuodatus"
                            type="text"
                            value={this.state.organisaatioSelection}
                            placeholder={this.props.L['VIRKAILIJAN_LISAYS_ORGANISAATIO']}
                            readOnly
                        />
                        <OrganisaatioSelectModal
                            locale={this.props.locale}
                            L={this.props.L}
                            onSelect={this.selectOrganisaatio.bind(this)}
                            organisaatiot={omattiedotOrganisaatiotToOrganisaatioSelectObject(
                                this.props.omatOrganisaatios,
                                this.props.locale
                            )}
                            disabled={false}
                        ></OrganisaatioSelectModal>
                    </div>
                    <div>
                        <RyhmaSelection
                            selectedOrganisaatioOid={selectedOrganisaatioOid}
                            selectOrganisaatio={this.selectOrganisaatio.bind(this)}
                        />
                    </div>
                </div>

                <div className="row permissions-row">
                    <label htmlFor="permissions">
                        {this.props.L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA']}
                    </label>

                    <div className="permissionSelect">
                        <KayttooikeusryhmaSelectModal
                            locale={this.props.locale}
                            L={this.props.L}
                            kayttooikeusryhmat={kayttooikeusryhmat}
                            kayttooikeusryhmaValittu={addedOrg.selectedPermissions.length > 0}
                            onSelect={this.addPermission.bind(this, selectablePermissions)}
                            isOrganisaatioSelected={!!addedOrg.oid}
                            loading={addedOrg.isPermissionsLoading}
                            sallittuKayttajatyyppi="VIRKAILIJA"
                        />
                    </div>

                    <ul className="kutsuminen-selected-permissions">
                        {addedOrg.selectedPermissions.map((permission) => {
                            return (
                                <li key={permission.ryhmaId}>
                                    {toLocalizedText(this.props.locale, permission.ryhmaNames)}
                                    <i
                                        className="fa fa-times-circle right remove-icon"
                                        onClick={this.removePermission.bind(this, permission)}
                                        aria-hidden="true"
                                    />
                                </li>
                            );
                        })}
                    </ul>

                    <div className="clear" />

                    <label>{this.props.L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</label>
                    <div>
                        <SimpleDatePicker
                            className="oph-input"
                            value={addedOrg.voimassaLoppuPvm}
                            onChange={this.selectVoimassaLoppuPvm}
                            filterDate={(date) => date.isBetween(moment(), moment().add(1, 'years'), 'day', '[]')}
                        />
                    </div>
                </div>
                <div className="clear" />
            </div>
        );
    }

    selectVoimassaLoppuPvm = (voimassaLoppuPvm: string | null | undefined) => {
        this.props.kutsuOrganisaatioSetProperties(this.props.index, {
            voimassaLoppuPvm: voimassaLoppuPvm,
        });
    };

    addPermission(selectablePermissions: Array<MyonnettyKayttooikeusryhma>, kayttooikeusryhma: Kayttooikeusryhma) {
        const selectedPermission = R.find(R.propEq('ryhmaId', kayttooikeusryhma.id))(selectablePermissions);
        this.props.addOrganisaatioPermission(this.props.addedOrg.oid, selectedPermission);
    }

    removePermission(permission: MyonnettyKayttooikeusryhma, e: React.SyntheticEvent<EventTarget>) {
        e.preventDefault();
        this.props.removeOrganisaatioPermission(this.props.addedOrg.oid, permission);
    }

    selectOrganisaatio(selection: any) {
        if (!selection) {
            return;
        }
        const isOrganisaatio = selection.hasOwnProperty('oid');
        const selectedOrganisaatioOid = isOrganisaatio ? selection.oid : selection.value;
        const organisaatio = isOrganisaatio
            ? selection
            : findOmattiedotOrganisatioOrRyhmaByOid(
                  selectedOrganisaatioOid,
                  this.props.omatOrganisaatios,
                  this.props.locale
              );
        if (isOrganisaatio && organisaatio) {
            this.setState({ organisaatioSelection: organisaatio.name });
        } else {
            this.setState({ organisaatioSelection: '' });
        }
        if (organisaatio) {
            this.props.kutsuSetOrganisaatio(this.props.index, organisaatio);
        }
        this.props.fetchAllowedKayttooikeusryhmasForOrganisation(this.props.currentHenkiloOid, selectedOrganisaatioOid);
    }
}

const mapStateToProps = (state) => ({
    currentHenkiloOid: state.omattiedot.data.oid,
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    omatOrganisaatios: state.omattiedot.organisaatios,
    ryhmatState: state.ryhmatState,
});

export default connect<Props, OwnProps>(mapStateToProps, {
    kutsuAddOrganisaatio,
    kutsuSetOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    fetchAllowedKayttooikeusryhmasForOrganisation,
    kutsuOrganisaatioSetProperties,
    addOrganisaatioPermission,
    removeOrganisaatioPermission,
})(AddedOrganization);
