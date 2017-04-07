import React from 'react'
import { connect } from 'react-redux';
import { getOrganisaatios } from './OrganisaatioUtilities';
import R from 'ramda'
import './AddedOrganization.css';
import { kutsuAddOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    kutsuSetOrganisaatio,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio} from '../../actions/uusivirkailijakutsu.actions';
import { toLocalizedText } from '../../localizabletext'
import Select2 from '../common/select/Select2';
import OrgSelect2 from './OrgSelect2'
import locale from '../../configuration/locale';

class AddedOrganisation extends React.Component {

    render() {
        const addedOrg = this.props.addedOrg;
        const availableOrgs = getOrganisaatios(this.props.orgs);
        const excludedOrgOids = R.map(R.prop('oid'), R.filter(org => addedOrg.oid !== org.oid)(this.props.addedOrgs));
        const selectablePermissions = R.difference(addedOrg.selectablePermissions, addedOrg.selectedPermissions);
        const L = this.props.l10n[locale];
        const orgs = R.filter(org => excludedOrgOids.indexOf(org.oid) < 0, availableOrgs);
        return (
            <div className="added-org" key={addedOrg.oid}>
                <div className="row">
                     <label htmlFor="org">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}
                    </label>
                    <OrgSelect2 id="org"
                                onSelect={this.changeOrganization.bind(this)}
                                data={orgs.map(this.mapOrganisaatio)}
                                l10n={L}
                                value={addedOrg.oid}
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
                                 text: toLocalizedText(locale, permission.ryhmaNames)
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
                                    {toLocalizedText(locale, permission.ryhmaNames)}
                                    <i className="fa fa-times-circle right remove-icon" onClick={this.removeAddedPermission.bind(null, permission.ryhmaId)} aria-hidden="true"></i>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="clear"></div>
            </div>
        )
    }

    changeOrganization(event) {
        const selectedOrganisaatioOid = event.target.value;
        const availableOrganisaatios = getOrganisaatios(this.props.orgs);
        const organisaatio = R.find(R.propEq('oid', selectedOrganisaatioOid))(availableOrganisaatios);
        this.props.kutsuSetOrganisaatio(this.props.index, organisaatio);
        this.props.fetchKutsujaKayttooikeusForHenkiloInOrganisaatio(this.props.omattiedot.data.oid, organisaatio.oid)
    }

    mapOrganisaatio(organisaatio) {
        const organisaatioNimi = org => toLocalizedText(locale, organisaatio.nimi);
        return {
            id: organisaatio.oid,
            searchText: organisaatio.fullLocalizedName,
            text: `${organisaatioNimi(organisaatio)} (${organisaatio.tyypit.join(',')})`,
            level: organisaatio.level
        };

    }

    removeAddedOrg(oid, e) {
        e.preventDefault();
        this.props.kutsuRemoveOrganisaatio(oid);
    }

    selectPermissions(e) {
        const selectedIds = Array.apply(null, e.target.options)
            .filter(option => option.selected)
            .map(option => option.value)
            .map(value => parseInt(value, 10));
        const selectedPermissions = R.filter((permission) => selectedIds.includes(permission.ryhmaId), this.props.addedOrg.selectablePermissions);
        this.props.addedOrg.selectedPermissions = R.union(this.props.addedOrg.selectedPermissions, selectedPermissions);

        // organisations.updated();
    }

    removeAddedPermission(id, e) {
        e.preventDefault();
        this.props.addedOrg.selectedPermissions = R.reject(permission => permission.ryhmaId === id, this.props.addedOrg.selectedPermissions);

        // organisations.updated();
    }

}

AddedOrganisation.PropTypes = {
    changeOrganization: React.PropTypes.func,
    l10n: React.PropTypes.object,
    addedOrgs: React.PropTypes.array,
    addedOrg: React.PropTypes.object,
    orgs: React.PropTypes.array,
    uiLang: React.PropTypes.object,
    index: React.PropTypes.number
};

const mapStateToProps = (state) => {
    return {
        omattiedot: state.omattiedot
    }
};

export default connect(mapStateToProps, {
    kutsuAddOrganisaatio,
    kutsuSetOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio})(AddedOrganisation);