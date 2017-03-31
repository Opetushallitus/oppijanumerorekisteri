import './OppijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent'

const OppijaViewPage = React.createClass({

    render: function() {
        return (
            <div>
                <div className="wrapper">
                    {
                        this.props._isUserContentLoading()
                            ? this.props.L['LADATAAN']
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale} showPassive={false}
                                                      basicInfo={this.props._createBasicInfo}
                                                      basicInfo2={this.props._createBasicInfo2}
                                                      loginInfo={this.props._createLoginInfo}
                                                      readOnlyButtons={this.props._readOnlyButtons}
                                                      editButtons={this.props._editButtons} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props._isContactContentLoading()
                            ? this.props.L['LADATAAN']
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={this.props.locale} />
                    }
                </div>
            </div>
        )
    },

});

export default OppijaViewPage;