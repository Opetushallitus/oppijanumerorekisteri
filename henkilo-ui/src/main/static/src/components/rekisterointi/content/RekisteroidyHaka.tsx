import React from 'react';
import { urls } from 'oph-urls-js';
import { connect } from 'react-redux';
import type { RootState } from '../../../reducers';
import type { Localisations } from '../../../types/localisation.type';
import Asiointikieli from '../../common/henkilo/labelvalues/Asiointikieli';
import IconButton from '../../common/button/IconButton';
import HakaIcon from '../../common/icons/HakaIcon';

type OwnProps = {
    henkilo: {
        henkilo: {
            etunimet: string;
            sukunimi: string;
            kutsumanimi: string;
        };
        username?: string;
        password?: string;
        passwordAgain?: string;
    };
    updatePayloadModel: () => void;
    temporaryKutsuToken: string;
};

type StateProps = {
    L: Localisations;
};

type Props = OwnProps & StateProps;

class RekisteroidyPerustiedot extends React.Component<Props> {
    render() {
        const hakaLoginUrl = urls.url('cas.haka', { temporaryToken: this.props.temporaryKutsuToken } || {});
        return (
            <div>
                <p className="oph-h3 oph-bold">{this.props.L['REKISTEROIDY_HAKA_OTSIKKO']}</p>
                <Asiointikieli
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

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(RekisteroidyPerustiedot);
