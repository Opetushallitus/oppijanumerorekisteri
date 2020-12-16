import React from 'react';
import { urls } from 'oph-urls-js';
import { connect } from 'react-redux';
import Asiointikieli from '../../common/henkilo/labelvalues/Asiointikieli';
import IconButton from '../../common/button/IconButton';
import HakaIcon from '../../common/icons/HakaIcon';

type Props = {
    henkilo: {
        henkilo: {
            etunimet: string;
            sukunimi: string;
            kutsumanimi: string;
        };
        username: string;
        password: string;
        passwordAgain: string;
    };
    updatePayloadModel: () => void;
    koodisto: {
        kieli: string[];
    };
    temporaryKutsuToken: string;
    L: Record<string, string>;
};

class RekisteroidyPerustiedot extends React.Component<Props> {
    render() {
        const hakaLoginUrl = urls.url('cas.haka', { temporaryToken: this.props.temporaryKutsuToken } || {});
        return (
            <div>
                <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_HAKA_OTSIKKO']}</p>
                <Asiointikieli
                    koodisto={this.props.koodisto}
                    henkiloUpdate={this.props.henkilo.henkilo}
                    updateModelFieldAction={this.props.updatePayloadModel}
                />
                <IconButton href={hakaLoginUrl}>
                    <HakaIcon />
                </IconButton>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps)(RekisteroidyPerustiedot);
