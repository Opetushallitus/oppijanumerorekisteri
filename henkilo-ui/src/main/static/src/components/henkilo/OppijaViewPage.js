import './OppijaViewPage.css'
import React from 'react'
import HenkiloViewUserContent from '../common/henkilo/HenkiloViewUserContent'
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent'
import AbstractViewContainer from "../../containers/henkilo/AbstractViewContainer";
import Loader from "../common/icons/Loader";

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
                            ? <Loader />
                            : <HenkiloViewUserContent {...this.props} readOnly={true} locale={this.props.locale} showPassive={false}
                                                      basicInfo={this.props.createBasicInfo}
                                                      basicInfo2={this.props.createBasicInfo2}
                                                      loginInfo={this.props.createLoginInfo}
                                                      readOnlyButtons={this.props.readOnlyButtons} />
                    }
                </div>
                <div className="wrapper">
                    {
                        this.props.isContactContentLoading()
                            ? <Loader />
                            : <HenkiloViewContactContent {...this.props} readOnly={true} locale={this.props.locale}
                                                         creatableYhteystietotyypit={this.props.creatableYhteystietotyypit}/>
                    }
                </div>
            </div>
        )
    };
}

export default OppijaViewPage;