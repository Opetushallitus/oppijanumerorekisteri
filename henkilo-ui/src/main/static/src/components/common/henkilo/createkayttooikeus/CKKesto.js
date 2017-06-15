import React from 'react'
import DatePicker from 'react-datepicker'
import moment from 'moment'

const CKKesto = ({alkaaPvmAction, alkaaInitValue, paattyyPvmAction, paattyyInitValue, L}) =>
    <tr key="kayttooikeusKestoField">
        <td>
            <span className="oph-bold">{L['HENKILO_LISAA_KAYTTOOIKEUDET_KESTO']}</span>:
        </td>
        <td>
            <div className="kayttooikeus-input-container">
                <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_ALKAA']}</span>
                <DatePicker className="oph-input"
                            onChange={alkaaPvmAction}
                            selected={alkaaInitValue}
                            showYearDropdown
                            showWeekNumbers dateFormats="DD.MM.YYYY" />
            </div>
            <div className="kayttooikeus-input-container">
                <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</span>
                <DatePicker className="oph-input"
                            onChange={paattyyPvmAction}
                            selected={paattyyInitValue}
                            showYearDropdown
                            showWeekNumbers />
            </div>
        </td>
        <td/>
    </tr>;

CKKesto.propTypes = {
    alkaaPvmAction: React.PropTypes.func,
    paattyyPvmAction: React.PropTypes.func,
    alkaaInitValue: React.PropTypes.object,
    paattyyInitValue: React.PropTypes.object,
    L: React.PropTypes.object,
};

export default CKKesto;