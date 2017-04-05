import './VirkailijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewOrganisationContent from '../common/henkilo/HenkiloViewOrganisationContent'

const VirkailijaViewPage = React.createClass({
    render: function() {
        return (
            <div>
                <div className="wrapper">
                    {
                        this.props.isUserContentLoading()
                            ? this.props.L['LADATAAN']
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
                            ? this.props.L['LADATAAN']
                            : <HenkiloViewOrganisationContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
            </div>
        )
    },
});

export default VirkailijaViewPage;