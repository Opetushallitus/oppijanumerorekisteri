import React from 'react';
import ItemList from './ItemList';
import './KayttooikeusryhmanOrganisaatiorajoite.css';
import { Locale } from '../../../types/locale.type';
import type { Options } from 'react-select';
import { Localisations } from '../../../types/localisation.type';
import OrganisaatioSelectModal from '../../common/select/OrganisaatioSelectModal';
import { OrganisaatioSelectObject } from '../../../types/organisaatioselectobject.types';
import OphCheckboxFieldset from '../../common/forms/OphCheckboxFieldset';
import { toLocalizedText } from '../../../localizabletext';

type Props = {
    L: Localisations;
    koodisto: any;
    locale: Locale;
    ryhmaRestriction: boolean;
    toggleRyhmaRestriction: () => void;
    organisaatioSelections: Array<OrganisaatioSelectObject>;
    organisaatioSelectAction: (organisaatio: OrganisaatioSelectObject) => void;
    removeOrganisaatioSelectAction: (selection: OrganisaatioSelectObject) => void;
    oppilaitostyypitSelections: Array<string>;
    oppilaitostyypitSelectAction: (selection: React.ChangeEvent<HTMLInputElement>) => void;
    organisaatiotyypitSelections: Array<string>;
    organisaatiotyypitSelectAction: (selection: React.ChangeEvent<HTMLInputElement>) => void;
};

type State = {
    oppilaitostyypitOptions: Array<any>;
    organisaatiotyypitOptions: Array<any>;
};

export default class KayttooikeusryhmanOrganisaatiorajoite extends React.Component<Props, State> {
    state = {
        oppilaitostyypitOptions: [],
        organisaatiotyypitOptions: [],
    };

    componentWillMount() {
        const oppilaitostyypitOptions: Options<string> = this.props.koodisto.oppilaitostyypit.map(
            (oppilaitostyyppi) => ({
                label: oppilaitostyyppi[this.props.locale],
                value: oppilaitostyyppi.value,
            })
        );
        const organisaatiotyypitOptions: Options<string> = this.props.koodisto.organisaatiotyyppiKoodisto.map(
            (organisaatiotyyppi) => ({
                label: toLocalizedText(this.props.locale, organisaatiotyyppi.metadata) || organisaatiotyyppi.koodiUri,
                value: organisaatiotyyppi.koodiUri,
            })
        );
        this.setState({ oppilaitostyypitOptions, organisaatiotyypitOptions });
    }

    render() {
        return (
            <div className="kayttooikeusryhman-myonto-kohde">
                <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_ORGANISAATIORAJOITE_OTSIKKO']}</h4>
                <label className="oph-checkable" htmlFor="ryhmarestriction">
                    <input
                        id="ryhmarestriction"
                        className="oph-checkable-input"
                        type="checkbox"
                        onChange={this.props.toggleRyhmaRestriction}
                        checked={this.props.ryhmaRestriction}
                    />
                    <span className="oph-checkable-text">{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_RYHMA']}</span>
                </label>

                <div className="flex-horizontal">
                    <div className="flex-item-1 ">
                        <OrganisaatioSelectModal onSelect={this.props.organisaatioSelectAction} />
                        <ItemList
                            items={this.props.organisaatioSelections}
                            labelPath={['name']}
                            removeAction={this.props.removeOrganisaatioSelectAction}
                        />
                    </div>
                    <div className="flex-item-1 oppilaitostyyppi-wrapper">
                        <OphCheckboxFieldset
                            legendText={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_OPPILAITOSTYYPPI']}
                            options={this.state.oppilaitostyypitOptions.map((option) => ({
                                label: option.label,
                                value: option.value,
                                checked:
                                    this.props.oppilaitostyypitSelections &&
                                    this.props.oppilaitostyypitSelections.indexOf(option.value) !== -1,
                            }))}
                            selectAction={this.props.oppilaitostyypitSelectAction}
                        />
                    </div>
                    <div className="flex-item-1 organisaatiotyyppi-wrapper">
                        <OphCheckboxFieldset
                            legendText={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_ORGANISAATIOTYYPPI']}
                            options={this.state.organisaatiotyypitOptions.map((option) => ({
                                label: option.label,
                                value: option.value,
                                checked:
                                    this.props.organisaatiotyypitSelections &&
                                    this.props.organisaatiotyypitSelections.indexOf(option.value) !== -1,
                            }))}
                            selectAction={this.props.organisaatiotyypitSelectAction}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
