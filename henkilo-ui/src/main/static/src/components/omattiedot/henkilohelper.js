import dateformat from 'dateformat';

const _getBasicInfoKansalaisuus = (henkilo, locale, koodistoKansalaisuus) => {
    return henkilo.kansalaisuus && henkilo.kansalaisuus.length
        ? henkilo.kansalaisuus.map((values, idx) => ({
            label: 'HENKILO_KANSALAISUUS',
            data: koodistoKansalaisuus.map(koodi => ({id: koodi.value, text: koodi[locale]})),
            value: koodistoKansalaisuus.filter(kansalaisuus =>
            kansalaisuus.value === values.kansalaisuusKoodi)[0][locale],
            inputValue: 'kansalaisuus.' + idx + '.kansalaisuusKoodi',
            selectValue: values.kansalaisuusKoodi
        })).reduce((a, b) => a.concat(b))
    : {
            label: 'HENKILO_KANSALAISUUS',
            data: koodistoKansalaisuus.map(koodi => ({id: koodi.value, text: koodi[locale]})),
            inputValue: 'kansalaisuus.0.kansalaisuusKoodi',
            value: null
        }
};

const _getBasicInfoAidinkieli = (henkilo, locale, koodistoKieli) => {
    return {
        label: 'HENKILO_AIDINKIELI',
        data: koodistoKieli.map(koodi => ({id: koodi.value, text: koodi[locale]})),
        inputValue: 'aidinkieli.kieliKoodi',
        value: henkilo.aidinkieli && koodistoKieli.filter(kieli =>
        kieli.value === henkilo.aidinkieli.kieliKoodi)[0][locale],
        selectValue: henkilo.aidinkieli && henkilo.aidinkieli.kieliKoodi
    }
};

const _getBasicInfoSukupuoli = (henkilo, locale, koodistoSukupuoli) => {
    return {
        label: 'HENKILO_SUKUPUOLI',
        data: koodistoSukupuoli.map(koodi => ({id: koodi.value, text: koodi[locale]})),
        inputValue: 'sukupuoli',
        value: henkilo.sukupuoli && koodistoSukupuoli.filter(sukupuoli =>
        sukupuoli.value === henkilo.sukupuoli)[0][locale],
        selectValue: henkilo.sukupuoli
    };
};

const _getBasicInfoOppijanumero = (henkilo) => {
    return {label: 'HENKILO_OPPIJANUMERO', value: henkilo.oidHenkilo, inputValue: 'oidHenkilo'};
};

const _getBasicInfoAsiointikieli = (henkilo, locale, koodistoKieli) => {
    return {
        label: 'HENKILO_ASIOINTIKIELI',
        data: koodistoKieli.map(koodi => ({id: koodi.value, text: koodi[locale]})),
        inputValue: 'asiointiKieli.kieliKoodi',
        value: henkilo.asiointiKieli && koodistoKieli.filter(kieli =>
        kieli.value === henkilo.asiointiKieli.kieliKoodi)[0][locale],
        selectValue: henkilo.asiointiKieli && henkilo.asiointiKieli.kieliKoodi
    }
};

export const createBasicInfoWrapper = (henkilo, L) => {
    return () => createBasicInfo(henkilo, L);
};

export const createBasicinfo2Wrapper = (henkilo, locale, koodisto) => {
    return () => createBasicInfo2(henkilo, locale, koodisto);
};

export const createBasicInfo = (henkilo, L) => {
    return [
        {label: 'HENKILO_ETUNIMET', value: henkilo.etunimet, inputValue: 'etunimet', autoFocus: true},
        {label: 'HENKILO_SUKUNIMI', value: henkilo.sukunimi, inputValue: 'sukunimi'},
        {label: 'HENKILO_SYNTYMAAIKA', inputValue: 'syntymaaika', date: true,
            value: dateformat(new Date(henkilo.syntymaaika), L['PVM_FORMAATTI']), },
        {label: 'HENKILO_HETU', value: henkilo.hetu, inputValue: 'hetu'},
        {label: 'HENKILO_KUTSUMANIMI', value: henkilo.kutsumanimi, inputValue: 'kutsumanimi'}
    ]
};

export const createBasicInfo2 = (henkilo, locale, koodisto) => {
    const kansalaisuus = _getBasicInfoKansalaisuus(henkilo, locale, koodisto.kansalaisuus);
    const aidinkieli = _getBasicInfoAidinkieli(henkilo, locale, koodisto.kieli);
    const sukupuoli = _getBasicInfoSukupuoli(henkilo, locale, koodisto.sukupuoli);
    const oppijanumero = _getBasicInfoOppijanumero(henkilo);
    const asiointikieli = _getBasicInfoAsiointikieli(henkilo, locale, koodisto.kieli);

    return [ kansalaisuus, aidinkieli, sukupuoli, oppijanumero, asiointikieli ];
};

export const createLoginInfo = (kayttajatieto) => {
    return [
        {label: 'HENKILO_KAYTTAJANIMI', value: kayttajatieto.username, inputValue: 'kayttajanimi'},
        {label: 'HENKILO_PASSWORD', value: null, showOnlyOnWrite: false, inputValue: 'password', password: true},
        {label: 'HENKILO_PASSWORDAGAIN', value: null, showOnlyOnWrite: true, inputValue: 'passwordAgain', password: true}
    ]
};