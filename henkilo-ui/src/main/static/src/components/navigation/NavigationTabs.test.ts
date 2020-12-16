import { vtjDataAvailable } from './NavigationTabs';

describe('Test NavigationTabs', () => {
    describe('vtjDataAvailable', () => {
        it('should return false if there is no data in yksilointitiedot', () => {
            expect(vtjDataAvailable(undefined)).toBeFalsy();
            expect(vtjDataAvailable({})).toBeFalsy();
            expect(vtjDataAvailable({ etunimet: undefined, sukunimi: undefined })).toBeFalsy();
        });

        it('should return true if there is any data in yksilointitiedot', () => {
            expect(vtjDataAvailable({ etunimet: 'foo', sukupuoli: undefined })).toBeTruthy();
            expect(vtjDataAvailable({ sukupuoli: 'mies', kutsumanimi: 'foo' })).toBeTruthy();
        });
    });
});
