// @flow
import React from 'react';
import OrganisaatioSelection from '../../common/select/OrganisaatioSelection';
import OphSelect from '../../common/select/OphSelect';
import ItemList from './ItemList';
import './KayttooikeusryhmanMyontoKohde.css';

type Props = {
    L: any,
    organisaatioSelections: Array<any>,
    organisaatioSelectAction: (selection: any) => void,
    omattiedot: any,
}

type State ={
    selectedOrganisaatios: Array<any>
}

export default class KayttooikeusryhmanMyontoKohde extends React.Component<Props, State> {

    render() {
        return <div className="kayttooikeusryhman-myonto-kohde">
            <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_KUVAUS_KENELLE_MYONNETAAN']}</h4>
            <div className="flex-horizontal">

                <div className="flex-item-1">

                    <OrganisaatioSelection id="organisaatiofilter"
                                           organisaatios={this.props.omattiedot.organisaatios}
                                           selectOrganisaatio={this.props.organisaatioSelectAction}>
                    </OrganisaatioSelection>
                    <ItemList items={this.props.organisaatioSelections}
                              labelPath={['label']}
                              removeAction={() => {}}></ItemList>

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

}