import React from 'react';
import './DuplikaatitPersonOtherApplications.css';

type Hakemus = {
    kansalaisuus?: string;
    aidinkieli?: string;
    matkapuhelinnumero?: string;
    sahkoposti?: string;
    passinumero?: string;
    lahiosoite?: string;
    postinumero?: string;
    kansallinenIdTunnus?: string;
    state?: string;
    href?: string;
    oid?: string;
};

type Props = {
    hakemukset: Hakemus[];
    koodisto: {};
    locale: string;
    styleClasses?: string;
    L: Record<string, string>;
};
export default class DuplikaatitPersonOtherApplications extends React.Component<Props> {
    render() {
        return (
            <div>
                {this.props.hakemukset.map(hakemus => {
                    return (
                        <div className="application" key={hakemus.oid}>
                            <span>{hakemus.kansalaisuus || ''}</span>
                            <span>{hakemus.aidinkieli || ''}</span>
                            <span>{hakemus.matkapuhelinnumero || ''}</span>
                            <span>{hakemus.sahkoposti || ''}</span>
                            <span>{hakemus.lahiosoite || ''}</span>
                            <span>{hakemus.postinumero || ''}</span>
                            <span>{hakemus.passinumero || ''}</span>
                            <span>{hakemus.kansallinenIdTunnus || ''}</span>
                            <span>{hakemus.state || ''}</span>
                            <span>
                                {hakemus.href ? (
                                    <a className="oph-link" href={hakemus.href}>
                                        {hakemus.oid}
                                    </a>
                                ) : (
                                    ''
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
}
