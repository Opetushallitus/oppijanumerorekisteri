// @flow
import React from 'react';
import PropTypes from 'prop-types'
import { AddedOrganizations } from './AddedOrganizations';
import Button from "../common/button/Button";
import type {KutsuOrganisaatio, OrganisaatioHenkilo} from "../../types/domain/kayttooikeus/OrganisaatioHenkilo.types";
import type {Henkilo} from "../../types/domain/oppijanumerorekisteri/henkilo.types";

type Props = {
    addedOrgs: Array<KutsuOrganisaatio>,
    l10n: {},
    orgs: Array<OrganisaatioHenkilo>,
    henkilo: Henkilo,
    addOrganisaatio: (KutsuOrganisaatio) => void,
    locale: string,
}

export default class KutsuOrganisaatios extends React.Component<Props> {

    static propTypes = {
        addedOrgs: PropTypes.array,
        l10n: PropTypes.object,
        orgs: PropTypes.array,
        henkilo: PropTypes.object,
        addOrganisaatio: PropTypes.func,
        locale: PropTypes.string
    };

    render() {
        const L = this.props.l10n[this.props.locale];

        return (
            <fieldset className="add-to-organisation">
                <span className="oph-h2 oph-strong">{L['VIRKAILIJAN_LISAYS_ORGANISAATIOON_OTSIKKO']}</span>
                <AddedOrganizations orgs={this.props.orgs}
                                    addedOrgs={this.props.addedOrgs}
                                    l10n={this.props.l10n}
                                    locale={this.props.locale}/>
                <div className="row">
                    <Button href="#" action={this.addEmptyOrganization.bind(this)}>{L['VIRKAILIJAN_KUTSU_LISAA_ORGANISAATIO_LINKKI']}</Button>
                </div>
            </fieldset>
        )
    }

    addEmptyOrganization(e: Event) {
        e.preventDefault();
        this.props.addOrganisaatio({
            oid: '',
            organisation: {oid: ''},
            selectablePermissions: [],
            selectedPermissions: []
        });
    }

}

