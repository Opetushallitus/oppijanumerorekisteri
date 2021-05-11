import { mapErrorTypeToErrorMessage } from './notifications.reducer';

describe('mapErrorTypeToErrorMessage', () => {
    test.each([
        ['NotFoundException', 'REKISTEROIDY_TEMP_TOKEN_INVALID'],
        ['UsernameAlreadyExistsException', 'REKISTEROIDY_USERNAMEEXISTS_TEKSTI'],
        ['PasswordException', 'REKISTEROIDY_PASSWORDEXCEPTION_TEKSTI'],
        ['IllegalArgumentException', 'REKISTEROIDY_ILLEGALARGUMENT_TEKSTI'],
        ['whatever eg. default', 'KUTSU_LUONTI_EPAONNISTUI_TUNTEMATON_VIRHE'],
        ['', 'KUTSU_LUONTI_EPAONNISTUI_TUNTEMATON_VIRHE'],
    ])('Resolves error message correctly when error is "%s"', (errorType, errorMessageText) =>
        expect(mapErrorTypeToErrorMessage(errorType).notL10nText).toEqual(errorMessageText)
    );
});
