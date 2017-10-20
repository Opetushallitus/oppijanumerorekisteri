import React from 'react'
import PropTypes from 'prop-types'
import DatePicker from 'react-datepicker'
import moment from 'moment'

const CKKesto = ({alkaaPvmAction, alkaaInitValue, paattyyPvmAction, paattyyInitValue, L, vuosia}) =>
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
                            showWeekNumbers
                            filterDate={(date) => date.isBefore(moment().add(vuosia, 'years'))} />
            </div>
            <div className="kayttooikeus-input-container">
                <span className="oph-h5">{L['HENKILO_LISAA_KAYTTOOIKEUDET_PAATTYY']}</span>
                <DatePicker className="oph-input"
                            onChange={paattyyPvmAction}
                            selected={paattyyInitValue}
                            showYearDropdown
                            showWeekNumbers
                            filterDate={(date) => date.isBefore(moment().add(vuosia, 'years'))} />
            </div>
        </td>
        <td/>
    </tr>;

CKKesto.propTypes = {
    alkaaPvmAction: PropTypes.func,
    paattyyPvmAction: PropTypes.func,
    alkaaInitValue: PropTypes.object,
    paattyyInitValue: PropTypes.object,
    L: PropTypes.object,
    vuosia: PropTypes.number.isRequired,
};

export default CKKesto;