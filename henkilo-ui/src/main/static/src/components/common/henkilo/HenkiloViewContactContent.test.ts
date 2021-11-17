import { WORK_ADDRESS, EMAIL } from '../../../types/constants';
import { ContactInfo, endlingWorkAddress, resolveDefaultWorkAddress } from './HenkiloViewContactContent';

describe('HenkiloViewContactContent', () => {
    const value = {
        label: EMAIL,
        value: 'test',
        inputValue: null,
    };
    const workAddress: Partial<ContactInfo> = {
        id: 1,
        henkiloUiId: 'id',
        type: WORK_ADDRESS,
        value: [value],
    };
    const workAddressWithoutEmail = { ...workAddress, id: 2, value: [{ ...value, label: 'test' }] };
    const otherAddress = { ...workAddress, id: 3, type: 'test' };

    describe('endlingWorkAddress', () => {
        test.each([
            ['Finds work address when only address', workAddress, [workAddress], [], true],
            [
                'Finds work address among multiple addresses',
                workAddress,
                [otherAddress, workAddress, workAddressWithoutEmail],
                [],
                true,
            ],
            ['Multiple work addresses', workAddress, [workAddress, workAddress], [], false],
            ['Work address without email', workAddressWithoutEmail, [workAddress, workAddressWithoutEmail], [], false],
            ['Not a work address', otherAddress, [otherAddress], [], false],
            ['Excludes items in remove list by id', workAddress, [workAddress], [1], false],
            ['Excludes items in remove list by henkiloUiId', workAddress, [workAddress], ['id'], false],
        ])('%s', (_, infoGroup, contactInfo, removeList, expected) =>
            expect(endlingWorkAddress(infoGroup as ContactInfo, contactInfo as Array<ContactInfo>, removeList)).toEqual(
                expected
            )
        );
    });

    describe('resolveDefaultWorkAddress', () => {
        test.each([
            ['Handles invalid parameters', undefined, 0],
            ['Handles list of one work address', [workAddress], 1],
            ['Find one among many', [otherAddress, workAddress, workAddressWithoutEmail], 1],
            ['Picks the one with greatest id', [workAddress, { ...workAddress, id: 3 }, { ...workAddress, id: 2 }], 3],
        ])('%s', (_, contactInfo, expected) =>
            expect(resolveDefaultWorkAddress(contactInfo as Array<ContactInfo>)).toEqual(expected)
        );
    });
});
