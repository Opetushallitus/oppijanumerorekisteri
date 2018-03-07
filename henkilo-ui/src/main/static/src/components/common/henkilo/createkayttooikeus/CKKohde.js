import './CKKohde.css'
import React from 'react'
import PropTypes from 'prop-types'
import OrganisaatioSelection from "../../select/OrganisaatioSelection";
import {OrganisaatioSelectModal} from "../../select/OrganisaatioSelectModal";
import {
    organisaatioHierarkiaToOrganisaatioSelectObject
} from "../../../../utilities/organisaatio.util";

const CKKohde = ({organisationData, organisationAction, organisationValue, L, locale, selection}) => {
    const organisaatioSelectObjects = organisationData.length > 0 ? organisaatioHierarkiaToOrganisaatioSelectObject([organisationData[0].organisaatio], locale) : [];
    return <tr key="kayttokohdeField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_VALITSE']}</span>:
        </td>
        <td>
            <div className="kohdeOrganisaatio">
                <div>{selection}</div>
                <OrganisaatioSelectModal L={L}
                                         organisaatiot={organisaatioSelectObjects}
                                         locale={locale}
                                         disabled={organisationData.length === 0}
                                         onSelect={organisationAction}>

                </OrganisaatioSelectModal>
            </div>

            <div className="kohdeRyhma">
                <OrganisaatioSelection L={L}
                                       organisaatios={organisationData}
                                       selectOrganisaatio={organisationAction}
                                       selectedOrganisaatioOid={organisationValue}
                                       locale={locale}
                                       isRyhma={true}/>
            </div>
        </td>
        <td>
            <span className="oph-bold">{' ' + L['HENKILO_LISAA_KAYTTOOIKEUDET_TAI']}</span>
        </td>
    </tr>;
}


CKKohde.propTypes = {
    organisationData: PropTypes.array,
    L: PropTypes.object,
    organisationAction: PropTypes.func,
    organisationValue: PropTypes.string,
    locale: PropTypes.string,
};

export default CKKohde;