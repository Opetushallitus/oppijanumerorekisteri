// @flow
/**
 * Haettujen käyttöoikeusryhmien hakulomake.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup'
import './HaetutKayttooikeusRyhmatHakuForm.css';
import DelayedSearchInput from "../henkilohaku/DelayedSearchInput";
import CloseButton from "../common/button/CloseButton";
import OrganisaatioSelection from "../common/select/OrganisaatioSelection";
import OphSelect from "../common/select/OphSelect";
import {fetchOmattiedotOrganisaatios} from '../../actions/omattiedot.actions';
import * as R from 'ramda';
import type {L} from "../../types/l.type";
import type {Locale} from "../../types/locale.type";

type Props = {
    L: L,
    locale: Locale,
    onSubmit: ({}) => void,
    organisaatios: Array<{}>,
    isAdmin: boolean,
    isOphVirkailija: boolean,
    haetutKayttooikeusryhmatLoading: boolean,
    ryhmat: {ryhmas: Array<{}>},
    fetchOmattiedotOrganisaatios: () => void,
}

type State = {
    searchTerm: string,
    naytaKaikki: boolean,
    selectedOrganisaatio: ?string,
    selectedRyhma: ?number,
}

class HaetutKayttooikeusRyhmatHakuForm extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: '',
            naytaKaikki: false,
            selectedOrganisaatio: undefined,
            selectedRyhma: undefined
        };
    };

    componentDidMount() {
        this.props.fetchOmattiedotOrganisaatios();
    }

    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        locale: PropTypes.string.isRequired,
        haetutKayttooikeusryhmatLoading: PropTypes.bool.isRequired,
        isAdmin: PropTypes.bool,
        isOphVirkailija: PropTypes.bool,
        organisaatios: PropTypes.array,
        ryhmat: PropTypes.shape({
            ryhmas: PropTypes.array,
        })
    };

    render() {
        return (
            <form>
                <div className="flex-horizontal flex-align-center">
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item">
                        <DelayedSearchInput setSearchQueryAction={this.onHakutermiChange.bind(this)}
                                            defaultNameQuery={this.state.searchTerm}
                                            placeholder={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_HENKILO']}
                                            loading={this.props.haetutKayttooikeusryhmatLoading}/>
                    </div>
                    <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline">
                        <span className="flex-item-1">
                            <OrganisaatioSelection id="organisaatiofilter"
                                                   L={this.props.L}
                                                   locale={this.props.locale}
                                                   organisaatios={this.props.organisaatios}
                                                   selectOrganisaatio={this.onOrganisaatioChange.bind(this)}
                                                   selectedOrganisaatioOid={this.state.selectedOrganisaatio}>
                            </OrganisaatioSelection>
                        </span>
                        <span className="haetut-kayttooikeusryhmat-close-button">
                            <CloseButton closeAction={() => this.onOrganisaatioChange(undefined)}/>
                        </span>
                    </div>
                    {this.props.isAdmin || this.props.isOphVirkailija ?
                        <div className="flex-item-1 haetut-kayttooikeusryhmat-form-item flex-inline">
                            <span className="flex-item-1">
                                <OphSelect id="ryhmafilter"
                                           options={this._parseRyhmas(this.props.ryhmat)}
                                           value={this.state.selectedRyhma}
                                           placeholder={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_RYHMA']}
                                           onChange={this.onRyhmaChange.bind(this)}>
                                </OphSelect>
                            </span>
                            <span className="haetut-kayttooikeusryhmat-close-button">
                                <CloseButton closeAction={() => this.onRyhmaChange(undefined)}/>
                            </span>
                        </div>
                        : null}

                    {this.props.isAdmin &&
                    <div className="haetut-kayttooikeusryhmat-form-item">
                        <BooleanRadioButtonGroup value={this.state.naytaKaikki}
                                                 onChange={this.onNaytaKaikkiChange}
                                                 trueLabel={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_KAIKKI']}
                                                 falseLabel={this.props.L['HAETTU_KAYTTOOIKEUSRYHMA_HAKU_NAYTA_OPH']}/>
                    </div>
                    }
                </div>
            </form>
        );
    }

    parseChild(organisaatio, organisaatioOids) {
        organisaatioOids.push(organisaatio.oid);
        if (organisaatio.children.length > 0) {
            organisaatio.children.forEach(organisaatio => this.parseChild(organisaatio, organisaatioOids));
        }
    }

    _parseRyhmas(ryhmatState) {
        const ryhmat = R.path(['ryhmas'], ryhmatState);
        return ryhmat ? ryhmat.map(ryhma => ({
            label: ryhma.nimi[this.props.locale],
            value: ryhma.oid
        })) : [];
    }

    onHakutermiChange = (event) => {
        const hakutermi = event.value;
        this.setState({searchTerm: hakutermi});
        if (hakutermi.length === 0 || hakutermi.length >= 3) {
            this.props.onSubmit({q: hakutermi});
        }
    };

    onOrganisaatioChange = (organisaatioSelection) => {
        const organisaatioOid = organisaatioSelection ? organisaatioSelection.value : undefined;
        this.setState({selectedOrganisaatio: organisaatioOid, selectedRyhma: undefined});
        this.props.onSubmit({organisaatioOids: organisaatioOid});
    };

    onRyhmaChange = (ryhma) => {
        const ryhmaOid = ryhma ? ryhma.value : undefined;
        this.setState({selectedRyhma: ryhmaOid, selectedOrganisaatio: undefined});
        this.props.onSubmit({organisaatioOids: ryhmaOid});
    };

    onNaytaKaikkiChange = (naytaKaikki) => {
        this.setState({selectedOrganisaatio: null, naytaKaikki: naytaKaikki});
        this.props.onSubmit({adminView: !naytaKaikki});
    };
}

const mapStateToProps = (state, ownProps) => ({
    L: state.l10n.localisations[state.locale],
    locale: state.locale,
    organisaatios: state.omattiedot.organisaatios,
    isAdmin: state.omattiedot.isAdmin,
    isOphVirkailija: state.omattiedot.isOphVirkailija,
    haetutKayttooikeusryhmatLoading: state.haetutKayttooikeusryhmat.isLoading,
    ryhmat: state.ryhmatState,
});

export default connect(mapStateToProps, {fetchOmattiedotOrganisaatios})(HaetutKayttooikeusRyhmatHakuForm);
