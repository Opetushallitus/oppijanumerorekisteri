// @flow
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import * as R from 'ramda';
import './AddedOrganization.css';
import {
    kutsuAddOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    kutsuSetOrganisaatio,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio,
    addOrganisaatioPermission,
    removeOrganisaatioPermission
} from '../../actions/kutsuminen.actions';
import {toLocalizedText} from '../../localizabletext'
import OrganisaatioSelection from '../common/select/OrganisaatioSelection';
import {getOrganisaatios} from "./OrganisaatioUtilities";
import type {
    KutsuKayttooikeusryhma,
    KutsuOrganisaatio, Organisaatio,
    OrganisaatioHenkilo
} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import OphSelect from "../common/select/OphSelect";

type Props = {
    changeOrganization: () => void,
    addedOrgs: Array<KutsuOrganisaatio>,
    addedOrg: KutsuOrganisaatio,
    l10n: {},
    locale: string,
    orgs: Array<OrganisaatioHenkilo>,
    index: number,
    kutsuRemoveOrganisaatio: (string) => void,
    kutsuSetOrganisaatio: (number, Organisaatio) => void,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio: (string, string) => void,
    currentHenkiloOid: string,
    addOrganisaatioPermission: (string, ?KutsuKayttooikeusryhma) => void,
    removeOrganisaatioPermission: (string, KutsuKayttooikeusryhma) => void,
}

class AddedOrganisation extends React.Component<Props> {

    static propTypes = {
        changeOrganization: PropTypes.func,
        l10n: PropTypes.object,
        addedOrgs: PropTypes.array,
        addedOrg: PropTypes.object,
        orgs: PropTypes.array,
        index: PropTypes.number,
        locale: PropTypes.string
    };

    render() {
        const addedOrg = this.props.addedOrg;
        const L = this.props.l10n[this.props.locale];
        const selectedOrganisaatioOid = this.props.addedOrg.organisation ? this.props.addedOrg.organisation.oid : '';
        const selectablePermissions = R.difference(addedOrg.selectablePermissions, addedOrg.selectedPermissions);
        const permissionsSelect = {
            options: selectablePermissions.map(permission => ({
                value: permission.ryhmaId,
                label: toLocalizedText(this.props.locale, permission.ryhmaNames),
                disabled: !addedOrg.oid
            }))
        };

        return (
            <div className="added-org" key={addedOrg.oid}>
                <div className="row">
                    <label htmlFor="org">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}
                    </label>
                    <div className="organisaatioSelection-container">
                        <OrganisaatioSelection selectedOrganisaatioOid={selectedOrganisaatioOid}
                                               selectOrganisaatio={this.selectOrganisaatio.bind(this)}
                        />
                        <OrganisaatioSelection selectedOrganisaatioOid={selectedOrganisaatioOid}
                                               selectOrganisaatio={this.selectOrganisaatio.bind(this)}
                                               isRyhma={true}
                        />
                    </div>
                </div>

                <div className="row permissions-row">
                    <label htmlFor="permissions">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA']} *
                    </label>

                    <OphSelect name="permission-select"
                            className={'permissionSelect'}
                            onChange={this.addPermission.bind(this, selectablePermissions)}
                            options={permissionsSelect.options}
                            placeholder={L['VIRKAILIJAN_LISAYS_SUODATA_KAYTTOOIKEUKSIA']}
                            noResultsText={L['EI_TULOKSIA']}>
                    </OphSelect>

                    <ul className="kutsuminen-selected-permissions">
                        {addedOrg.selectedPermissions.map(permission => {
                            return (
                                <li key={permission.ryhmaId}>
                                    {toLocalizedText(this.props.locale, permission.ryhmaNames)}
                                    <i className="fa fa-times-circle right remove-icon"
                                       onClick={this.removePermission.bind(this, permission)} aria-hidden="true"/>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="clear"/>
            </div>
        )
    }


    removeOrganisaatio(oid) {
        this.props.kutsuRemoveOrganisaatio(oid);
    }

    addPermission(selectablePermissions, selection) {
        const ryhmaId = parseInt(selection.value, 10);
        const selectedPermission = R.find(R.propEq('ryhmaId', ryhmaId))(selectablePermissions);
        this.props.addOrganisaatioPermission(this.props.addedOrg.oid, selectedPermission);
    }

    removePermission(permission, e) {
        e.preventDefault();
        this.props.removeOrganisaatioPermission(this.props.addedOrg.oid, permission);
    }

    selectOrganisaatio(selection) {
        if (!selection) {
            this.removeOrganisaatio(this.props.addedOrg.oid);
        }
        else {
            const selectedOrganisaatioOid = selection.value;
            const availableOrganisaatios = getOrganisaatios(this.props.orgs, this.props.locale);
            const organisaatio = R.find(R.propEq('oid', selectedOrganisaatioOid))(availableOrganisaatios);
            this.props.kutsuSetOrganisaatio(this.props.index, organisaatio);
            this.props.fetchKutsujaKayttooikeusForHenkiloInOrganisaatio(this.props.currentHenkiloOid, organisaatio.oid);
        }

    }
}

const mapStateToProps = (state) => ({
    currentHenkiloOid: state.omattiedot.data.oid,
    locale: state.locale
});

export default connect(mapStateToProps, {
    kutsuAddOrganisaatio,
    kutsuSetOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio,
    addOrganisaatioPermission,
    removeOrganisaatioPermission,
})(AddedOrganisation);