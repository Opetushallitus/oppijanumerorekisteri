import './CKKohde.css'
import React from 'react'
import PropTypes from 'prop-types'
import OrganisaatioSelection from "../../select/OrganisaatioSelection";

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
    organisationData: PropTypes.array,
    L: PropTypes.object,
    organisationAction: PropTypes.func,
    organisationValue: PropTypes.string,
    locale: PropTypes.string,
};

export default CKKohde;