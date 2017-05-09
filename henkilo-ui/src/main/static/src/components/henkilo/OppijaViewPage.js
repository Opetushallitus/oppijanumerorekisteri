import './OppijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent'
import AbstractViewContainer from "../../containers/henkilo/AbstractViewContainer";

class OppijaViewPage extends React.Component {
    render() {
        return (
            <div>
                <div className="wrapper">
                    <div>
                        {this.props.createNotifications(1)}
                    </div>
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
                        this.props.isContactContentLoading()
                            ? AbstractViewContainer.createLoader()
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={this.props.locale}
                                                         editButtons={this.props.editButtons}
                                                         creatableYhteystietotyypit={this.props.creatableYhteystietotyypit}/>
                    }
                </div>
            </div>
        )
    };
}

export default OppijaViewPage;