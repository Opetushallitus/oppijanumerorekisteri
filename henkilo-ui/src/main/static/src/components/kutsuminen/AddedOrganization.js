import React from 'react'
import {connect} from 'react-redux';
import R from 'ramda';
import Select from 'react-select';
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
import OrganisaatioSelection from './OrganisaatioSelection';
import {getOrganisaatios} from './OrganisaatioUtilities';

class AddedOrganisation extends React.Component {

    static propTypes = {
        changeOrganization: React.PropTypes.func,
        l10n: React.PropTypes.object,
        addedOrgs: React.PropTypes.array,
        addedOrg: React.PropTypes.object,
        orgs: React.PropTypes.array,
        uiLang: React.PropTypes.object,
        index: React.PropTypes.number,
        locale: React.PropTypes.string
    };

    render() {
        const addedOrg = this.props.addedOrg;
        const availableOrgs = getOrganisaatios(this.props.orgs, this.props.locale);
        const excludedOrgOids = R.map(R.prop('oid'), this.props.addedOrgs);
        const L = this.props.l10n[this.props.locale];
        const orgs = R.filter(org => excludedOrgOids.indexOf(org.oid) < 0, availableOrgs);
        const selectablePermissions = R.difference(addedOrg.selectablePermissions, addedOrg.selectedPermissions);
        const permissionsSelect = {
            options: selectablePermissions.map(permission => ({
                value: permission.ryhmaId,
                label: toLocalizedText(this.props.locale, permission.ryhmaNames),
                disabled: !addedOrg.oid
            }))
        };

        const selectedOrganisaatioName = this.props.addedOrg.organisation ? this.props.addedOrg.organisation.fullLocalizedName : '';
        return (
            <div className="added-org" key={addedOrg.oid}>
                <div className="row">
                    <label htmlFor="org">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}
                    </label>

                    <OrganisaatioSelection originalOrganisaatios={this.props.orgs}
                                           organisaatios={orgs}
                                           selectedOrganisaatioName={selectedOrganisaatioName}
                                           locale={this.props.locale}
                                           index={this.props.index}
                                           selectOrganisaatio={this.selectOrganisaatio.bind(this)}
                                           L={L}></OrganisaatioSelection>
                </div>

                <div className="row permissions-row">
                    <label htmlFor="permissions">
                        {L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_MYONNA_KAYTTOOIKEUKSIA']} *
                    </label>

                    <Select name="permission-select"
                            className={'permissionSelect'}
                            onChange={this.addPermission.bind(this, selectablePermissions)}
                            options={permissionsSelect.options}
                            placeholder={L['VIRKAILIJAN_LISAYS_SUODATA_KAYTTOOIKEUKSIA']}
                            noResultsText={L['EI_TULOKSIA']}>
                    </Select>

                    <ul className="selected-permissions">
                        {addedOrg.selectedPermissions.map(permission => {
                            return (
                                <li key={permission.ryhmaId}>
                                    {toLocalizedText(this.props.locale, permission.ryhmaNames)}
                                    <i className="fa fa-times-circle right remove-icon"
                                       onClick={this.removePermission.bind(this, permission)} aria-hidden="true"></i>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="clear"></div>
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
        } else {
            const selectedOrganisaatioOid = selection.value;
            const availableOrganisaatios = getOrganisaatios(this.props.orgs, this.props.locale);
            const organisaatio = R.find(R.propEq('oid', selectedOrganisaatioOid))(availableOrganisaatios);
            this.props.kutsuSetOrganisaatio(this.props.index, organisaatio);
            this.props.fetchKutsujaKayttooikeusForHenkiloInOrganisaatio(this.props.omattiedot.data.oid, organisaatio.oid);
        }

    }
}

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
    removeOrganisaatioPermission
})(AddedOrganisation);