import './VirkailijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent'
import AbstractViewContainer from "../../containers/henkilo/AbstractViewContainer";
import HenkiloViewExistingKayttooikeus from "../common/henkilo/HenkiloViewExistingKayttooikeus";
import HenkiloViewExpiredKayttooikeus from "../common/henkilo/HenkiloViewExpiredKayttooikeus";
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";
import HenkiloViewCreateKayttooikeus from "../common/henkilo/HenkiloViewCreateKayttooikeus";

class VirkailijaViewPage extends React.Component {
    constructor(props) {
        super(props);

        this.existingKayttooikeusRef = {};
    }
    render() {
        return (
            <div>
                <div className="wrapper">
                    {
                        this.props.isUserContentLoading()
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale} showPassive={false}
                                                      basicInfo={this.props.createBasicInfo}
                                                      basicInfo2={this.props.createBasicInfo2}
                                                      loginInfo={this.props.createLoginInfo}
                                                      readOnlyButtons={this.props.readOnlyButtons}
                                                      editButtons={this.props.editButtons} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.isOrganisationContentLoading()
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewExistingKayttooikeus {...this.props}
                                                               ref={(ref) => this.existingKayttooikeusRef = ref} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusAnomusLoading
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewOpenKayttooikeusanomus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.kayttooikeus.kayttooikeusLoading
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewExpiredKayttooikeus {...this.props} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.henkilo.henkiloOrganisaatiosLoading
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewCreateKayttooikeus {...this.props}
                                                             existingKayttooikeusRef={this.existingKayttooikeusRef} />
                    }
                </div>
            </div>
        )
    }
}

export default VirkailijaViewPage;