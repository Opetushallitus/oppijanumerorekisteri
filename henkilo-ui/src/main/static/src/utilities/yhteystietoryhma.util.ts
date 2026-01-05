import { YhteystietoRyhma } from '../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { Yhteystieto } from '../types/domain/oppijanumerorekisteri/yhteystieto.types';
import { validateEmail } from '../validation/EmailValidator';

/*
 * Palauttaa true jos kaikki sähköpostikentät YhteystiedotRyhma-listassa ovat valideja sähköpostiosoitteita
 */
export const validateYhteystiedotRyhmaEmails = (yhteystiedotRyhma?: YhteystietoRyhma[]): boolean =>
    !!yhteystiedotRyhma?.length &&
    yhteystiedotRyhma.map(validYhteystietoRyhma).reduce((prev: boolean, curr: boolean) => prev && curr, true);

/*
 * Palauttaa true jos kaikki sähköpostikentät yksittäisessä YhteystiedotRyhma:ssa ovat valideja sähköpostiosoitteita
 */
const validYhteystietoRyhma = (yhteystietoRyhma: YhteystietoRyhma): boolean => {
    return yhteystietoRyhma.yhteystieto
        .filter((yhteystieto: Yhteystieto) => yhteystieto.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        .map((y) => validateEmail(y.yhteystietoArvo ?? ''))
        .reduce((prev: boolean, curr: boolean) => prev && curr, true);
};
