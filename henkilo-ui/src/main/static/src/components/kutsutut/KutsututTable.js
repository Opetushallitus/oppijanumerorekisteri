import React from 'react';
import PropTypes from 'prop-types'
import moment from 'moment';
import './KutsututTable.css';
import Table from '../common/table/Table';
import Button from '../common/button/Button';
import {http} from "../../http";
import {urls} from 'oph-urls-js';

export default class KutsututTable extends React.Component {

    static propTypes = {
        fetchKutsus: PropTypes.func,
        L: PropTypes.object.isRequired,
        kutsus: PropTypes.array,
        cancelInvitation: PropTypes.func,
        locale: PropTypes.string.isRequired,
        isLoading: PropTypes.bool.isRequired,
        allFetched: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            sorted: [{id: 'KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO', desc: true}],
        };
    }

    render() {
        const L = this.props.L;
        const headings = [{ key: 'KUTSUT_NIMI_OTSIKKO', label: L['KUTSUT_NIMI_OTSIKKO'] },
            { key: 'KUTSUT_SAHKOPOSTI_OTSIKKO', label: L['KUTSUT_SAHKOPOSTI_OTSIKKO'] },
            { key: 'KUTSUTUT_ORGANISAATIO_OTSIKKO', label: L['KUTSUTUT_ORGANISAATIO_OTSIKKO'], notSortable: true, },
            { key: 'KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO', label: L['KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO'] },
            { key: 'KUTSUTUT_LAHETA_UUDELLEEN', label: L['KUTSUTUT_LAHETA_UUDELLEEN'], notSortable: true},
            { key: 'KUTSU_PERUUTA', label: L['KUTSUTUT_PERUUTA_KUTSU'], notSortable: true},
        ];
        
        const data = this.props.kutsus.map( kutsu => ({
            KUTSUT_NIMI_OTSIKKO: this.createNimiCell(kutsu),
            KUTSUT_SAHKOPOSTI_OTSIKKO: this.createSahkopostiCell(kutsu),
            KUTSUTUT_ORGANISAATIO_OTSIKKO: this.createOrganisaatiotCell(kutsu),
            KUTSUTUT_KUTSU_LAHETETTY_OTSIKKO: this.createKutsuLahetettyCell(kutsu),
            KUTSUTUT_LAHETA_UUDELLEEN: this.createResendCell(kutsu),
            KUTSU_PERUUTA: this.createPeruutaCell(kutsu)
        }));
        
        return <div className="kutsututTableWrapper">
            <Table headings={headings}
                   noDataText={this.props.L['KUTSUTUT_VIRKAILIJAT_TYHJA']}
                   data={data}
                   striped
                   manual={true}
                   defaultSorted={this.state.sorted}
                   onFetchData={this.onTableFetch.bind(this)}
                   fetchMoreSettings={{
                       isActive: !this.props.allFetched && !this.props.isLoading,
                       fetchMoreAction: this.onSubmitWithoutClear.bind(this),
                   }}
                   tableLoading={this.props.isLoading}
            />
        </div>;
    }

    createNimiCell(kutsu) {
        return `${kutsu.etunimi} ${kutsu.sukunimi}`;
    }

    createSahkopostiCell(kutsu) {
        return kutsu.sahkoposti;
    }

    createOrganisaatiotCell(kutsu) {
        return (<div>
                { kutsu.organisaatiot.map(org => <div key={org.organisaatioOid}>{org.nimi[this.props.locale] || org.organisaatioOid}</div>)}
                </div>);
    }

    createKutsuLahetettyCell(kutsu) {
        const sent = moment(new Date(kutsu.aikaleima));
        return (<span>{sent.format()} {sent.add(1, 'months').isBefore(moment()) ? <span className="oph-red">{this.props.L['KUTSUTUT_VIRKAILIJAT_KUTSU_VANHENTUNUT']}</span> : null}</span>);
    }

    createResendCell(kutsu) {
        const deleteUrl = urls.url('kayttooikeus-service.peruutaKutsu', kutsu.id);
        const createUrl = urls.url('kayttooikeus-service.kutsu');
        const resendAction = () => http.delete(deleteUrl)
            .then(() => http.post(createUrl, kutsu))
            .then(() => this.props.fetchKutsus(this.state.sorted[0]));
        return kutsu.tila === 'AVOIN' &&
            <Button
                    action={resendAction}>
                {this.props.L['KUTSUTUT_LAHETA_UUDELLEEN_NAPPI']}
            </Button>
    }

    createPeruutaCell(kutsu) {
        return kutsu.tila === 'AVOIN' &&
            <Button cancel
                    action={this.props.cancelInvitation(kutsu)}>
                {this.props.L['KUTSUTUT_PERUUTA_KUTSU_NAPPI']}
            </Button>
    }

    onTableFetch(tableState, instance) {
        const newSort = tableState.sorted[0];
        const stateSort = this.state.sorted[0];
        // Update sort state
        if(newSort) {
            this.setState({
                    sorted: [Object.assign({}, newSort)],
                },
                // If sort state changed fetch new data
                () => {if(!stateSort || newSort.id !== stateSort.id || newSort.desc !== stateSort.desc) {
                    this.props.fetchKutsus(newSort);
                }});

        }
    }

    onSubmitWithoutClear() {
        this.props.fetchKutsus(this.state.sorted[0], true);
    }

}

