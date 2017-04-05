import './VirkailijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent'
import AbstractViewContainer from "../../containers/henkilo/AbstractViewContainer";

const VirkailijaViewPage = React.createClass({
    render: function() {
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
            </div>
        )
    },
});

export default VirkailijaViewPage;