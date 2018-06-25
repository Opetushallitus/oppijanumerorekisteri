// @flow
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import LabelValueGroup from "./LabelValueGroup";
import {fetchHenkiloLinkitykset} from "../../../../actions/henkiloLinkitys.actions";
import type {HenkiloLinkitysState} from "../../../../reducers/henkiloLinkitys.reducer";

type HenkiloVarmentajaSuhdeProps = {
    oidHenkilo: string,
    type: 'henkiloVarmentajas' | 'henkiloVarmennettavas',
    fetchHenkiloLinkitykset: (string) => () => Promise<void>,
    linkitetyt: HenkiloLinkitysState,
}

/**
 * Hakee ja näyttää henkilön varmentajasuhteen LabelValueGroup:ina. Näitä suhteita on vain virkailijoilla joten linkki
 * olettaa /virkailija polun.
 */
class HenkiloVarmentajaSuhde extends React.Component<HenkiloVarmentajaSuhdeProps> {
    typeToL10nKeyMap: {[string]: string};

    componentWillMount() {
        this.props.fetchHenkiloLinkitykset(this.props.oidHenkilo);
    }

    constructor(props) {
        super(props);

        this.typeToL10nKeyMap = {
            henkiloVarmentajas: 'HENKILO_VARMENTAJA',
            henkiloVarmennettavas: 'HENKILO_VARMENNETTAVA',
        };
    }

    render() {
        const linkitetytByOid = this.props.linkitetyt[this.props.oidHenkilo];
        return <div>
            {
                linkitetytByOid && linkitetytByOid[this.props.type] && !!linkitetytByOid[this.props.type].length &&
                <LabelValueGroup valueGroup={this.linkitetytGroup(linkitetytByOid[this.props.type])}
                                 label={this.typeToL10nKeyMap[this.props.type]}/>
            }
        </div>;
    }

    linkitetytGroup(varmentajas) {
        return <React.Fragment>
            {
                varmentajas.map((varmentajaOid, index) =>
                    <div key={index} className="nowrap">
                        <Link to={HenkiloVarmentajaSuhde.getVirkailijaLink(varmentajaOid)}>{varmentajaOid}</Link>
                    </div>
                )
            }
        </React.Fragment>;
    }

    static getVirkailijaLink(oid) {
        return `/virkailija/${oid}`;
    }

}

const mapStateToProps = (state) => ({
    linkitetyt: state.linkitykset,
});

export default connect(mapStateToProps, {fetchHenkiloLinkitykset})(HenkiloVarmentajaSuhde);
