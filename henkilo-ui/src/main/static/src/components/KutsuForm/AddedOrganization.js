import React from 'react'

export const AddedOrganization = () => <span>Organization</span>
/*
import R from 'ramda'

import organisations from '../../logic/organisations'
import { toLocalizedText } from '../../logic/localizabletext'
import Select2 from 'select';
import OrgSelect2 from './OrgSelect2'

import './AddedOrganisation.css'
const AddedOrganisation = React.createClass({
    render: function () {
        const addedOrg = this.props.addedOrg;
        const excludedOrgOids = R.map(R.prop('oid'), R.filter(org => addedOrg.oid !== org.oid)(this.props.addedOrgs));
        const selectablePermissions = R.difference(addedOrg.selectablePermissions, addedOrg.selectedPermissions);
        const L = this.props.l10n;
        const uiLang = this.props.uiLang;
        const orgs = R.filter(org => excludedOrgOids.indexOf(org.oid) < 0, this.props.orgs);
        const organisaatioNimi = org => toLocalizedText(uiLang, org.nimi);
        const mapOrgOption = org => ({
            id: org.oid,
            searchText: org.fullLocalizedName,
            text: `${organisaatioNimi(org)} (${org.tyypit.join(',')})`,
            level: org.level
        });
        return (
            <div className="added-org" key={addedOrg.oid}>
                <div className="row">
                    <label htmlFor="org">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']} *
                    </label>
                    <OrgSelect2 id="org" onSelect={this.props.changeOrganization(addedOrg.oid)}
                                data={orgs.map(mapOrgOption)}
                                l10n={L} value={addedOrg.oid}
                                options={{placeholder: L['VIRKAILIJAN_LISAYS_VALITSE_ORGANISAATIO']}}/>
                    <i className="fa fa-times-circle remove-icon after"
                       onClick={this.removeAddedOrg.bind(null, addedOrg.oid)} aria-hidden="true"></i>
                </div>

                <div className="row permissions-row">
                    <label htmlFor="permissions">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA']} *
                    </label>
                    <Select2 onSelect={this.selectPermissions} multiple id="permissions" l10n={L}
                             data={selectablePermissions.map(permission => ({
                                 id: permission.ryhmaId,
                                 text: toLocalizedText(uiLang, permission.ryhmaNames)
                             }))}
                             options={{
                                 disabled: !addedOrg.oid,
                                 placeholder: L['VIRKAILIJAN_LISAYS_SUODATA_KAYTTOOIKEUKSIA']
                             }}>
                    </Select2>
                    <ul className="selected-permissions">
                        {addedOrg.selectedPermissions.map(permission => {
                            return (
                                <li key={permission.ryhmaId}>
                                    {toLocalizedText(this.props.uiLang, permission.ryhmaNames)}
                                    <i className="fa fa-times-circle right remove-icon"
                                       onClick={this.removeAddedPermission.bind(null, permission.ryhmaId)}
                                       aria-hidden="true"></i>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="clear"></div>
            </div>
        )
    },

    removeAddedOrg: function (oid, e) {
        e.preventDefault();
        organisations.removeByOid(oid);
    },

    selectPermissions: function (e) {
        const selectedIds = Array.apply(null, e.target.options)
            .filter(option => option.selected)
            .map(option => option.value)
            .map(value => parseInt(value, 10));
        const selectedPermissions = R.filter((permission) => selectedIds.includes(permission.ryhmaId), this.props.addedOrg.selectablePermissions);
        this.props.addedOrg.selectedPermissions = R.union(this.props.addedOrg.selectedPermissions, selectedPermissions);
        organisations.updated();
    },

    removeAddedPermission: function (id, e) {
        e.preventDefault();
        this.props.addedOrg.selectedPermissions = R.reject(permission => permission.ryhmaId === id, this.props.addedOrg.selectedPermissions);
        organisations.updated();
    }

}
*/
