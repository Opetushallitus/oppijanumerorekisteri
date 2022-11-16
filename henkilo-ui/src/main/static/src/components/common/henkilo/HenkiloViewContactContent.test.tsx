import React from 'react';
import { shallow } from 'enzyme';
import { HenkiloViewContactContentComponent, Props } from './HenkiloViewContactContent';

describe('HenkiloViewContactContent', () => {
    const MINIMAL_PROPS = ({
        omattiedot: {
            isAdmin: true,
            organisaatiot: [],
        },
        henkilo: {
            henkilo: {
                yhteystiedotRyhma: [
                    {
                        ryhmaKuvaus: 'yhteystietotyyppi8',
                        ryhmaAlkuperaTieto: 'alkupera1',
                        yhteystieto: [
                            {
                                yhteystietoTyyppi: 'YHTEYSTIETO_SAHKOPOSTI',
                                yhteystietoArvo: 'foo@bar.qux',
                            },
                        ],
                    },
                    {
                        ryhmaKuvaus: 'yhteystietotyyppi2',
                        ryhmaAlkuperaTieto: 'alkupera2',
                        yhteystieto: [
                            {
                                yhteystietoTyyppi: 'YHTEYSTIETO_SAHKOPOSTI',
                                yhteystietoArvo: 'testi@testi.test',
                            },
                        ],
                    },
                ],
            },
            kayttaja: {},
        },
        locale: 'fi',
        L: {},
        koodisto: {
            yhteystietotyypit: [
                {
                    value: 'yhteystietotyyppi8',
                    fi: 'VTJ Sähköinen osoite',
                },
                {
                    value: 'yhteystietotyyppi2',
                    fi: 'Työosoite',
                    sv: 'Arbetsadress',
                },
            ],
        },
    } as unknown) as Props;

    describe('Hide contact details when needed', () => {
        test('Super user sees all', () => {
            const component = shallow(<HenkiloViewContactContentComponent {...MINIMAL_PROPS} />);
            expect(component.find('.midHeader')).toHaveLength(2);
            expect(component.contains('foo@bar.qux')).toBeTruthy();
        });

        test('VTJ data hidden from non-admins', () => {
            const component = shallow(
                <HenkiloViewContactContentComponent
                    {...{ ...MINIMAL_PROPS, omattiedot: { ...MINIMAL_PROPS.omattiedot, isAdmin: false } }}
                />
            );
            expect(component.find('.midHeader')).toHaveLength(1);
            expect(component.contains('foo@bar.qux')).toBeFalsy();
        });
    });
});
