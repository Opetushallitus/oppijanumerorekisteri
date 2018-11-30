// @flow

import React from 'react'
import {connect} from 'react-redux'
import type {Locale} from "../../types/locale.type";
import {EmailVerificationPage} from "./EmailVerificationPage";
import type {Localisations} from "../../types/localisation.type";
import {urls} from 'oph-urls-js';
import {http} from "../../http";
import Loader from "../common/icons/Loader";
import type {Henkilo} from "../../types/domain/oppijanumerorekisteri/henkilo.types";

type Props = {
    loginToken: string,
    locale: Locale,
    L:Localisations,
    router: any
}

type State = {
    loading: boolean,
    henkilo: Henkilo | any
}

/*
 * Virkailijan sähköpostin varmentamisen käyttöliittymä
 */
class EmailVerificationContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            henkilo: {}
        }
    }

    async componentDidMount() {
        if (this.props.loginToken) {
            const url = urls.url('kayttooikeus-service.cas.henkilo.bylogintoken', this.props.loginToken);
            try {
                this.setState({loading: true});
                const henkilo = await http.get(url);
                this.setState({henkilo, loading: false});
            } catch (error) {
                throw error;
            }
        }
    }

    render() {
        return this.state.loading ? <Loader /> : <EmailVerificationPage henkilo={this.state.henkilo}
                                                                        locale={this.props.locale}
                                                                        L={this.props.L}
                                                                        loginToken={this.props.loginToken}
                                                                        router={this.props.router}/>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[ownProps.params['locale'].toLowerCase()],
    loginToken: ownProps.params['loginToken'],
    locale: ownProps.params['locale']
});

export default connect(mapStateToProps, {})(EmailVerificationContainer)