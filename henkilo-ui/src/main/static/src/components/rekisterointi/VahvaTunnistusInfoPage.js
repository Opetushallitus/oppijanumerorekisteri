// @flow
import React from 'react'
import Button from "../common/button/Button";
import {urls} from 'oph-urls-js';
import type {L} from "../../types/localisation.type";
import InfoPage from "../common/page/InfoPage";

type Props = {
    loginToken: string,
    locale: string,
    L: L,
}

class VahvaTunnistusInfoPage extends React.Component<Props> {
    render() {
        const targetUrl = urls.url('shibboleth.kayttooikeus-service.cas.tunnistus', {
            loginToken: this.props.loginToken,
            kielisyys: this.props.locale,
        });
        const identificationUrl: string = urls.url('shibboleth.identification', this.props.locale.toUpperCase(), {target: targetUrl});
        return <InfoPage topicLocalised={this.props.L['VAHVATUNNISTUSINFO_OTSIKKO']}>
            {this.props.L['VAHVATUNNISTUSINFO_TEKSTI']}
            <div style={{textAlign: 'center'}}>
                <Button href={identificationUrl}
                        isButton={true}>
                    {this.props.L['VAHVATUNNISTUSINFO_LINKKI']}
                </Button>
            </div>
        </InfoPage>;
    }
}

export default VahvaTunnistusInfoPage;
