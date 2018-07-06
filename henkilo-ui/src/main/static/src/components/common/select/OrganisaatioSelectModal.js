// @flow
import React from 'react';
import type {Locale} from "../../../types/locale.type";
import type {L} from "../../../types/localisation.type";
import {OrganisaatioSelect} from "./OrganisaatioSelect";
import type {OrganisaatioSelectObject} from "../../../types/organisaatioselectobject.types";
import SelectModal from "../modal/SelectModal";

type OrganisaatioSelectModalProps = {
    locale: Locale,
    L: L,
    organisaatiot: Array<OrganisaatioSelectObject>,
    onSelect: (organisaatio: OrganisaatioSelectObject) => void,
    disabled: boolean
}

type State = {
    visible: boolean
}

/*
 * Organisaation valinta modalissa
 */
export class OrganisaatioSelectModal extends React.Component<OrganisaatioSelectModalProps, State> {

    constructor(props: OrganisaatioSelectModalProps) {
        super(props);

        this.state = {
            visible: false
        }
    }

    render() {
        return <SelectModal disabled={this.props.disabled}
                            buttonText={this.props.L['OMATTIEDOT_VALITSE_ORGANISAATIO']} >
            <OrganisaatioSelect
                locale={this.props.locale}
                L={this.props.L}
                organisaatiot={this.props.organisaatiot}
                onClose={() => {/*override*/}}
                onSelect={(organisaatio) => {this.props.onSelect(organisaatio)}}
            />
        </SelectModal>;
    }

}
