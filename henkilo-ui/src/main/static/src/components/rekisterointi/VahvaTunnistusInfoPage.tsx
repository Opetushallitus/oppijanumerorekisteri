import React from 'react';
import Button from '../common/button/Button';
import { urls } from 'oph-urls-js';
import { Localisations } from '../../types/localisation.type';
import InfoPage from '../common/page/InfoPage';

type Props = {
    loginToken: string;
    locale: string;
    L: Localisations;
};

class VahvaTunnistusInfoPage extends React.Component<Props> {
    render() {
        const targetUrl = urls.url('cas-oppija.kayttooikeus-service.cas.tunnistus', {
            loginToken: this.props.loginToken,
            locale: this.props.locale,
        });
        const identificationUrl: string = urls.url('cas-oppija.identification', {
            service: targetUrl,
            locale: this.props.locale,
        });
        return (
            <InfoPage topicLocalised={this.props.L['VAHVATUNNISTUSINFO_OTSIKKO']}>
                <span className="oph-bold">{this.props.L['VAHVATUNNISTUSINFO_TEKSTI']}</span>
                <div style={{ textAlign: 'center', paddingTop: '25px' }}>
                    <Button href={identificationUrl} isButton big>
                        {this.props.L['VAHVATUNNISTUSINFO_LINKKI']}
                    </Button>
                </div>
            </InfoPage>
        );
    }
}

export default VahvaTunnistusInfoPage;
