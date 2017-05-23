import './HenkilohakuFilters.css'
import React from 'react'
import {Collapse} from 'react-collapse'

class HenkilohakuFilters extends React.Component {
    static propTypes = {
        L: React.PropTypes.object.isRequired,
        initialValues: React.PropTypes.shape({
            subOrganisation: React.PropTypes.bool.isRequired,
            noOrganisation: React.PropTypes.bool.isRequired,
            passivoitu: React.PropTypes.bool.isRequired,
            dublicates: React.PropTypes.bool.isRequired,
        }).isRequired,
        suborganisationAction: React.PropTypes.func.isRequired,
        noOrganisationAction: React.PropTypes.func.isRequired,
        passiivisetAction: React.PropTypes.func.isRequired,
        duplikaatitAction: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.L = this.props.L;

        this.state = {
            isOpen: true,
        };
    };

    render() {
        return <div>
            <a style={{cursor: "pointer"}} onClick={() => this.setState({isOpen: !this.state.isOpen,})} >
                {this.L['HENKILOHAKU_LISAVAIHTOEHDOT']}
            </a>
            <Collapse isOpened={this.state.isOpen}>
                <div className="henkilohakufilters-wrapper">
                    <div className="oph-field oph-field-inline">
                        <label className="oph-label oph-bold" aria-describedby="field-text">
                            {this.L['HENKILOHAKU_FILTERS_HAEMYOS']}
                        </label>
                        <label className="oph-checkable" htmlFor="subOrganisaatioCriteria">
                            <input id="subOrganisaatioCriteria" type="checkbox" className="oph-checkable-input"
                                   onChange={this.props.suborganisationAction} checked={this.props.initialValues.subOrganisation} />
                            <span className="oph-checkable-text"> {this.L['HENKILOHAKU_FILTERS_ALIORGANISAATIOISTA']}</span>
                        </label>
                        <label className="oph-checkable" htmlFor="noOrganisaatioCriteria">
                            <input id="noOrganisaatioCriteria" type="checkbox" className="oph-checkable-input"
                                   onChange={this.props.noOrganisationAction} checked={this.props.initialValues.noOrganisation} />
                            <span className="oph-checkable-text"> {this.L['HENKILOHAKU_FILTERS_ILMANORGANISAATIOTA']}</span>
                        </label>
                        <label className="oph-checkable" htmlFor="passiivisetCriteria">
                            <input id="passiivisetCriteria" type="checkbox" className="oph-checkable-input"
                                   onChange={this.props.passiivisetAction} checked={this.props.initialValues.passivoitu} />
                            <span className="oph-checkable-text"> {this.L['HENKILOHAKU_FILTERS_PASSIIVISET']}</span>
                        </label>
                        <label className="oph-checkable" htmlFor="duplikaatitCriteria">
                            <input id="duplikaatitCriteria" type="checkbox" className="oph-checkable-input"
                                   onChange={this.props.duplikaatitAction} checked={this.props.initialValues.dublicates} />
                            <span className="oph-checkable-text"> {this.L['HENKILOHAKU_FILTERS_DUPLIKAATIT']}</span>
                        </label>
                    </div>
                </div>
            </Collapse>
        </div>;
    };
}



export default HenkilohakuFilters;
