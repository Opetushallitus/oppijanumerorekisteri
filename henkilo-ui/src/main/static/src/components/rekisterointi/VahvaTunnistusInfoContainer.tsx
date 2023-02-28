import React from 'react';
import { connect } from 'react-redux';
import VahvaTunnistusInfoPage from './VahvaTunnistusInfoPage';
import VirhePage from '../common/page/VirhePage';
import { RootState } from '../../reducers';
import { Location } from 'history';
import type { Localisations } from '../../types/localisation.type';

type OwnProps = Location & { params: any, route: any };

type StateProps = {
    L: Localisations;
    loginToken: string;
    locale: string;
    virhe: boolean;
};

type Props = OwnProps & StateProps;

const VahvaTunnistusInfoContainer: React.FC<Props> = (props: Props) => {
    if (props.loginToken === 'vanha') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_TOKEN_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_TOKEN_TEKSTI"
                buttonText="VAHVATUNNISTUSINFO_VIRHE_TOKEN_LINKKI"
            />
        );
    } else if (props.loginToken === 'vaara') {
        return (
            <VirhePage
                topic="VAHVATUNNISTUSINFO_VIRHE_HETU_VAARA_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_HETU_VAARA_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (props.loginToken === 'palvelukayttaja') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_PALVELUKAYTTAJA_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_PALVELUKAYTTAJA_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (props.loginToken === 'eiloydy') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_EI_LOYDY_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_EI_LOYDY_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (props.loginToken === 'passivoitu') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_PASSIVOITU_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_PASSIVOITU_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (props.loginToken === 'eivirkailija') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_EI_VIRKAILIJA_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_EI_VIRKAILIJA_TEKSTI"
                buttonText="REKISTEROIDY_KIRJAUTUMISSIVULLE"
            />
        );
    } else if (props.loginToken === 'vanhakutsu') {
        return (
            <VirhePage
                theme="gray"
                topic="VAHVATUNNISTUSINFO_VIRHE_VANHA_KUTSU_OTSIKKO"
                text="VAHVATUNNISTUSINFO_VIRHE_VANHA_KUTSU_TEKSTI"
                buttonText=""
            />
        );
    } else if (props.virhe) {
        return <VirhePage topic="VAHVATUNNISTUSINFO_VIRHE_OTSIKKO" text="VAHVATUNNISTUSINFO_VIRHE_TEKSTI" />;
    } else {
        return <VahvaTunnistusInfoPage {...props} />;
    }
};

const mapStateToProps = (state: RootState, ownProps: OwnProps): StateProps => ({
    L: state.l10n.localisations[ownProps.params['locale'].toLowerCase()],
    loginToken: ownProps.params['loginToken'],
    locale: ownProps.params['locale'],
    virhe: ownProps.route.path.indexOf('/vahvatunnistusinfo/virhe/') !== -1,
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(VahvaTunnistusInfoContainer);
