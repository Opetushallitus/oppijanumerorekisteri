import { YhteystietoRyhma } from '../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { Yhteystieto } from '../types/domain/oppijanumerorekisteri/yhteystieto.types';
import { validateEmail } from '../validation/EmailValidator';

/*
 * Palauttaa true jos kaikki sähköpostikentät YhteystiedotRyhma-listassa ovat valideja sähköpostiosoitteita
 */
export const validateYhteystiedotRyhmaEmails = (yhteystiedotRyhma: Array<YhteystietoRyhma>): boolean => {
    return yhteystiedotRyhma.map(validYhteystietoRyhma).reduce((prev: boolean, curr: boolean) => prev && curr, true);
};

/*
 * Palauttaa true jos kaikki sähköpostikentät yksittäisessä YhteystiedotRyhma:ssa ovat valideja sähköpostiosoitteita
 */
export const validYhteystietoRyhma = (yhteystietoRyhma: YhteystietoRyhma): boolean => {
    return yhteystietoRyhma.yhteystieto
        .filter((yhteystieto: Yhteystieto) => yhteystieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map(validEmailYhteystieto)
        .reduce((prev: boolean, curr: boolean) => prev && curr, true);
};

/*
 * Palauttaa true, jos YHTEYSTIETO_SAHKOPOSTI -tyyppinen Yhteystieto sisältää validin sähköpostin
 */
export const validEmailYhteystieto = (yhteystieto: Yhteystieto): boolean => {
    const email: string = yhteystieto.yhteystietoArvo ? yhteystieto.yhteystietoArvo : '';
    return validateEmail(email);
};

/*
 * Palauttaa Yhteystiedot-listasta sähköpostiosoitekenttien lukumäärän, jotka eivät ole tyhjiä
 */
export const notEmptyYhteystiedotRyhmaEmailCount = (yhteystiedotRyhma: Array<YhteystietoRyhma>): number => {
    return yhteystiedotRyhma
        .map(notEmptyYhteystietoRyhmaEmailCount)
        .reduce((prev: number, curr: number) => prev + curr, 0);
};

/*
 * Palauttaa YhteystietoRyhman ei-tyhjien sähköpostitietueiden lukumäärän
 */
export const notEmptyYhteystietoRyhmaEmailCount = (yhteystietoRyhma: YhteystietoRyhma): number => {
    return yhteystietoRyhma.yhteystieto
        .filter((yhteystieto: Yhteystieto) => yhteystieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map(isNotEmptyYhteystietoEmail)
        .reduce((prev: number, curr: boolean) => (curr ? prev + 1 : prev), 0);
};

/*
 * Palauttaa true, jos YHTEYSTIETO_SAHKOPOSIT -tyyppinen Yhteystieto ei ole tyhjä
 */
export const isNotEmptyYhteystietoEmail = (yhteystieto: Yhteystieto): boolean => {
    const email: string = yhteystieto.yhteystietoArvo ? yhteystieto.yhteystietoArvo : '';
    return email.length >= 1;
};
