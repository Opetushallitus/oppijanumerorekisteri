import React from 'react'
import Button from "../common/button/Button";
import {urls} from 'oph-urls-js';

class VahvaTunnistusInfoPage extends React.Component {
    render() {
        const targetUrl = urls.url('shibboleth.kayttooikeus-service.cas.tunnistus', {
            loginToken: this.props.loginToken,
            locale: this.props.locale
        });
        const identificationUrl = urls.url('shibboleth.identification', this.props.locale.toUpperCase(), {target: targetUrl});
        return <div className="borderless-wrapper">
            {
                !this.props.virhe
                    ? <div>
                        <div className="oph-h2 oph-bold">{this.props.L['VAHVATUNNISTUSINFO_OTSIKKO']}</div>
                        {this.props.L['VAHVATUNNISTUSINFO_TEKSTI']}
                        <div>
                            <Button href={identificationUrl} >{this.props.L['VAHVATUNNISTUSINFO_LINKKI']}</Button>
                        </div>
                    </div>
                    : <div>
                        <div className="oph-h2 oph-bold">{this.props.L['VAHVATUNNISTUSINFO_VIRHE_OTSIKKO']}</div>
                        <span>{this.props.L['VAHVATUNNISTUSINFO_VIRHE_TEKSTI']}</span>
                    </div>
            }
        </div>;
    }
}

export default VahvaTunnistusInfoPage;
