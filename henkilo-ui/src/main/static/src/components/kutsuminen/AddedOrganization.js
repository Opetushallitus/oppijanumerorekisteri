import React from 'react'
import { connect } from 'react-redux';
import { getOrganisaatios } from './OrganisaatioUtilities';
import R from 'ramda'
import './AddedOrganization.css';
import { kutsuAddOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    kutsuSetOrganisaatio,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio,
    addOrganisaatioPermission,
    removeOrganisaatioPermission} from '../../actions/kutsuminen.actions';
import { toLocalizedText } from '../../localizabletext'
import Select2 from '../common/select/Select2';
import OrgSelect2 from './OrgSelect2'

class AddedOrganisation extends React.Component {

    render() {
        const addedOrg = this.props.addedOrg;
        const availableOrgs = getOrganisaatios(this.props.orgs, this.props.locale);
        const excludedOrgOids = R.map(R.prop('oid'), R.filter(org => addedOrg.oid !== org.oid)(this.props.addedOrgs));
        const selectablePermissions = R.difference(addedOrg.selectablePermissions, addedOrg.selectedPermissions);
        const L = this.props.l10n[this.props.locale];
        const orgs = R.filter(org => excludedOrgOids.indexOf(org.oid) < 0, availableOrgs);
        return (
            <div className="added-org" key={addedOrg.oid}>
                <div className="row">
                     <label htmlFor="org">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}
                    </label>
                    <OrgSelect2 id="org"
                                onSelect={this.changeOrganization.bind(this)}
                                data={orgs.map(this.mapOrganisaatio.bind(this))}
                                l10n={L}
                                value={addedOrg.oid}
                                options={{placeholder: L['VIRKAILIJAN_LISAYS_VALITSE_ORGANISAATIO']}}/>
                    <i className="fa fa-times-circle remove-icon after"
                       onClick={this.removeOrganisaatio.bind(this, addedOrg.oid)} aria-hidden="true"></i>
                </div>

                <div className="row permissions-row">
                    <label htmlFor="permissions">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA']} *
                    </label>
                    <Select2 onSelect={this.addPermission.bind(this, selectablePermissions)} multiple id="permissions" l10n={L}
                             data={selectablePermissions.map(permission => ({
                                 id: permission.ryhmaId,
                                 text: toLocalizedText(this.props.locale, permission.ryhmaNames)
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
                                    {toLocalizedText(this.props.locale, permission.ryhmaNames)}
                                    <i className="fa fa-times-circle right remove-icon" onClick={this.removePermission.bind(this, permission)} aria-hidden="true"></i>
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
        const availableOrganisaatios = getOrganisaatios(this.props.orgs, this.props.locale);
        const organisaatio = R.find(R.propEq('oid', selectedOrganisaatioOid))(availableOrganisaatios);
        this.props.kutsuSetOrganisaatio(this.props.index, organisaatio);
        this.props.fetchKutsujaKayttooikeusForHenkiloInOrganisaatio(this.props.omattiedot.data.oid, organisaatio.oid)
    }

    mapOrganisaatio(organisaatio) {
        const organisaatioNimi = org => toLocalizedText(this.props.locale, organisaatio.nimi);
        return {
            id: organisaatio.oid,
            searchText: organisaatio.fullLocalizedName,
            text: `${organisaatioNimi(organisaatio)} (${organisaatio.tyypit.join(',')})`,
            level: organisaatio.level
        };

    }

    removeOrganisaatio(oid, e) {
        e.preventDefault();
        this.props.kutsuRemoveOrganisaatio(oid);
    }   

    addPermission( selectablePermissions, event ) {
        const ryhmaId = parseInt(event.target.value, 10);
        const selectedPermission = R.find(R.propEq('ryhmaId', ryhmaId))(selectablePermissions);
        this.props.addOrganisaatioPermission(this.props.addedOrg.oid, selectedPermission);
    }

    removePermission(permission, e) {
        e.preventDefault();
        this.props.removeOrganisaatioPermission(this.props.addedOrg.oid, permission);
    }

}

AddedOrganisation.PropTypes = {
    changeOrganization: React.PropTypes.func,
    l10n: React.PropTypes.object,
    addedOrgs: React.PropTypes.array,
    addedOrg: React.PropTypes.object,
    orgs: React.PropTypes.array,
    uiLang: React.PropTypes.object,
    index: React.PropTypes.number,
};

const mapStateToProps = (state) => {
    return {
        omattiedot: state.omattiedot,
        locale: state.locale
    }
};

export default connect(mapStateToProps, {
    kutsuAddOrganisaatio,
    kutsuSetOrganisaatio,
    kutsuRemoveOrganisaatio,
    kutsuClearOrganisaatios,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio,
    addOrganisaatioPermission,
    removeOrganisaatioPermission})(AddedOrganisation);