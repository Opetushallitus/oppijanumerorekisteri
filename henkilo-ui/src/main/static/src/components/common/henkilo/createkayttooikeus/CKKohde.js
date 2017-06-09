import './CKKohde.css'
import React from 'react'
import OrganisaatioSelection from "../../../kutsuminen/OrganisaatioSelection";

const CKKohde = ({organisationData, organisationAction, organisationValue, L, locale}) =>
    <tr key="kayttokohdeField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</span>:
        </td>
        <td>
            <div className="kohdeOrganisaatio">
                <OrganisaatioSelection L={L}
                                       organisaatios={organisationData}
                                       selectOrganisaatio={organisationAction}
                                       selectedOrganisaatioOid={organisationValue}
                                       locale={locale} />
            </div>

            <div className="kohdeRyhma">
                <OrganisaatioSelection L={L}
                                       organisaatios={organisationData}
                                       selectOrganisaatio={organisationAction}
                                       selectedOrganisaatioOid={organisationValue}
                                       locale={locale}
                                       isRyhma={true} />
            </div>
        </td>
        <td>
            <span className="oph-bold">{' ' + L['HENKILO_LISAA_KAYTTOOIKEUDET_TAI']}</span>
        </td>
    </tr>;

CKKohde.propTypes = {
    organisationData: React.PropTypes.array,
    L: React.PropTypes.object,
    organisationAction: React.PropTypes.func,
    organisationValue: React.PropTypes.string,
    locale: React.PropTypes.string,
};

export default CKKohde;