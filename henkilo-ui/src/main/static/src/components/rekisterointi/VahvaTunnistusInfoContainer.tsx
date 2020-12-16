import React from 'react';
import { connect } from 'react-redux';
import VahvaTunnistusInfoPage from './VahvaTunnistusInfoPage';
import VirhePage from '../common/page/VirhePage';
import { RootState } from '../../reducers';
import { Location } from 'history';

type OwnProps = Location;

type Props = {
    L: Record<string, string>;
    loginToken: string;
    locale: string;
    virhe: boolean;
};

class VahvaTunnistusInfoContainer extends React.Component<Props> {
    render() {
        if (this.props.loginToken === 'vanha') {
            return (
                <VirhePage
                    theme="gray"
                    topic="VAHVATUNNISTUSINFO_VIRHE_TOKEN_OTSIKKO"
                    text="VAHVATUNNISTUSINFO_VIRHE_TOKEN_TEKSTI"
                    buttonText="VAHVATUNNISTUSINFO_VIRHE_TOKEN_LINKKI"
                />
            );
        } else if (this.props.loginToken === 'vaara') {
            return (
                <VirhePage
                    topic="VAHVATUNNISTUSINFO_VIRHE_HETU_VAARA_OTSIKKO"
                    text="VAHVATUNNISTUSINFO_VIRHE_HETU_VAARA_TEKSTI"
                    buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
                />
            );
        } else if (this.props.loginToken === 'palvelukayttaja') {
            return (
                <VirhePage
                    theme="gray"
                    topic="VAHVATUNNISTUSINFO_VIRHE_PALVELUKAYTTAJA_OTSIKKO"
                    text="VAHVATUNNISTUSINFO_VIRHE_PALVELUKAYTTAJA_TEKSTI"
                    buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
                />
            );
        } else if (this.props.loginToken === 'eiloydy') {
            return (
                <VirhePage
                    theme="gray"
                    topic="VAHVATUNNISTUSINFO_VIRHE_EI_LOYDY_OTSIKKO"
                    text="VAHVATUNNISTUSINFO_VIRHE_EI_LOYDY_TEKSTI"
                    buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
                />
            );
        } else if (this.props.loginToken === 'passivoitu') {
            return (
                <VirhePage
                    theme="gray"
                    topic="VAHVATUNNISTUSINFO_VIRHE_PASSIVOITU_OTSIKKO"
                    text="VAHVATUNNISTUSINFO_VIRHE_PASSIVOITU_TEKSTI"
                    buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
                />
            );
        } else if (this.props.loginToken === 'eivirkailija') {
            return (
                <VirhePage
                    theme="gray"
                    topic="VAHVATUNNISTUSINFO_VIRHE_EI_VIRKAILIJA_OTSIKKO"
                    text="VAHVATUNNISTUSINFO_VIRHE_EI_VIRKAILIJA_TEKSTI"
                    buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
                />
            );
        } else if (this.props.virhe) {
            return <VirhePage topic="VAHVATUNNISTUSINFO_VIRHE_OTSIKKO" text="VAHVATUNNISTUSINFO_VIRHE_TEKSTI" />;
        } else {
            return <VahvaTunnistusInfoPage {...this.props} />;
        }
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): Props => ({
    L: state.l10n.localisations[ownProps.params['locale'].toLowerCase()],
    loginToken: ownProps.params['loginToken'],
    locale: ownProps.params['locale'],
    virhe: ownProps.route.path.indexOf('/vahvatunnistusinfo/virhe/') !== -1,
});

export default connect(mapStateToProps, {})(VahvaTunnistusInfoContainer);
