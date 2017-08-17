import React from 'react'
import Button from "../common/button/Button";
import {urls} from 'oph-urls-js';

class VahvaTunnistusInfoPage extends React.Component {
    render() {
        const targetUrl = encodeURIComponent(urls.url('kayttooikeus-service.cas.tunnistus', {loginToken: this.props.loginToken}));
        const identificationUrl = urls.url('shibboleth.identification', this.props.locale.toUpperCase(), {target: targetUrl});
        return <div className="borderless-wrapper">
            <div className="oph-h2 oph-bold">{this.props.L['VAHVATUNNISTUSINFO_OTSIKKO']}</div>
            {this.props.L['VAHVATUNNISTUSINFO_TEKSTI']}
            <div>
                <Button href={identificationUrl} >{this.props.L['VAHVATUNNISTUSINFO_LINKKI']}</Button>
            </div>
        </div>;
    }
}

export default VahvaTunnistusInfoPage;
