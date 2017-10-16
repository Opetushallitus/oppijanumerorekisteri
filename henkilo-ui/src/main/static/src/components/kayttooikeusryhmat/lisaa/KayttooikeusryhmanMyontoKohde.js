// @flow
import React from 'react';
import OrganisaatioSelection from '../../common/select/OrganisaatioSelection';
import OphSelect from '../../common/select/OphSelect';

type Props = {
    L: any,
    organisaatioState: any,
    selectedOrganisaatioOid: string | void
}

export default class KayttooikeusryhmanMyontoKohde extends React.Component<Props, State> {




    render() {
        return <div>
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_KENELLE_MYONNETAAN']}</h4>
            <div className="flex-horizontal">


                <div className="flex-item-1">
                    <OrganisaatioSelection id="organisationFilter"
                                           organisaatios={this.props.organisaatioState.organisaatiot.organisaatiot}
                                           selectOrganisaatio={this.organisaatioSelectAction}
                                           selectedOrganisaatioOid={this.props.selectedOrganisaatioOid}/>
                </div>
                <div className="flex-item-1">
                    <OphSelect></OphSelect>
                </div>
                <div className="flex-item-1">
                    <OphSelect></OphSelect>
                </div>

            </div>
        </div>

    }

    organisaatioSelectAction = () => {

    }


}