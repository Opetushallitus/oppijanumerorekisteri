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
import {getOrganisaatios, omattiedotOrganisaatiotToOrganisaatioSelectObject} from "../../utilities/organisaatio.util";
import type {
    KutsuOrganisaatio, Organisaatio,
    OrganisaatioHenkilo
} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type {L} from "../../types/localisation.type";
import KayttooikeusryhmaSelectModal from '../common/select/KayttooikeusryhmaSelectModal'
import {myonnettyToKayttooikeusryhma} from '../../utils/KayttooikeusryhmaUtils'
import type {MyonnettyKayttooikeusryhma} from '../../types/domain/kayttooikeus/kayttooikeusryhma.types'
import {OrganisaatioSelectModal} from "../common/select/OrganisaatioSelectModal";

type Props = {
    changeOrganization: () => void,
    addedOrgs: Array<KutsuOrganisaatio>,
    addedOrg: KutsuOrganisaatio,
    locale: string,
    L: L,
    omatOrganisaatios: Array<OrganisaatioHenkilo>,
    index: number,
    kutsuRemoveOrganisaatio: (string) => void,
    kutsuSetOrganisaatio: (number, Organisaatio) => void,
    fetchKutsujaKayttooikeusForHenkiloInOrganisaatio: (string, string) => void,
    currentHenkiloOid: string,
    addOrganisaatioPermission: (string, ?MyonnettyKayttooikeusryhma) => void,
    removeOrganisaatioPermission: (string, MyonnettyKayttooikeusryhma) => void
}

type State = {
    organisaatioSelection: string
}

class AddedOrganisation extends React.Component<Props, State> {

    static propTypes = {
        changeOrganization: PropTypes.func,
        addedOrgs: PropTypes.array,
        addedOrg: PropTypes.object,
        omatOrganisaatios: PropTypes.array,
        index: PropTypes.number.isRequired,
        locale: PropTypes.string,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            organisaatioSelection: ''
        }
    }

    render() {
        const addedOrg = this.props.addedOrg;
        const selectedOrganisaatioOid = this.props.addedOrg.organisation ? this.props.addedOrg.organisation.oid : '';
        const selectablePermissions: Array<MyonnettyKayttooikeusryhma> | any = R.difference(addedOrg.selectablePermissions, addedOrg.selectedPermissions);
        const kayttooikeusryhmat = selectablePermissions.map(myonnettyToKayttooikeusryhma)

        return (
            <div className="added-org" key={addedOrg.oid}>
                <div className="row">
                    <label htmlFor="org">
                        {this.props.L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_ORGANISAATIO']}
                    </label>
                    <div className="organisaatioSelection-container">
                        <div>{this.state.organisaatioSelection}</div>
                        <OrganisaatioSelectModal locale={this.props.locale}
                                                 L={this.props.L}
                                                 onSelect={this.selectOrganisaatio.bind(this)}
                                                 organisaatiot={omattiedotOrganisaatiotToOrganisaatioSelectObject(this.props.omatOrganisaatios, this.props.locale)}
                                                 disabled={false}
                        ></OrganisaatioSelectModal>

                        <OrganisaatioSelection selectedOrganisaatioOid={selectedOrganisaatioOid}
                                               selectOrganisaatio={this.selectOrganisaatio.bind(this)}
                                               isRyhma={true}
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
                            onSelect={this.addPermission.bind(this, selectablePermissions)}
                            disabled={!addedOrg.oid}
                        />
                    </div>

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

    addPermission(selectablePermissions, kayttooikeusryhma) {
        const selectedPermission = R.find(R.propEq('ryhmaId', kayttooikeusryhma.id))(selectablePermissions);
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
            const isOrganisaatio = selection.hasOwnProperty('oid');
            const selectedOrganisaatioOid = isOrganisaatio ? selection.oid : selection.value;
            const availableOrganisaatios = getOrganisaatios(this.props.omatOrganisaatios, this.props.locale);
            const organisaatio = R.find(R.propEq('oid', selectedOrganisaatioOid))(availableOrganisaatios);
            if(isOrganisaatio && organisaatio && organisaatio.nimi) {
                this.setState({organisaatioSelection: selection.name});
            } else {
                this.setState({organisaatioSelection: ''});
            }
            this.props.kutsuSetOrganisaatio(this.props.index, organisaatio);
            this.props.fetchKutsujaKayttooikeusForHenkiloInOrganisaatio(this.props.currentHenkiloOid, organisaatio.oid);
        }

    }
}

const mapStateToProps = (state) => ({
    currentHenkiloOid: state.omattiedot.data.oid,
    locale: state.locale,
    L: state.l10n.localisations[state.locale],
    omatOrganisaatios: state.omattiedot.organisaatios,
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