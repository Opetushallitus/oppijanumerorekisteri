import { notificationList } from './notification.reducer';
import { GLOBAL_NOTIFICATION } from '../actions/actiontypes';
import { GlobalNotificationConfig } from '../types/notification.types';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';

describe('Tests for notication reducer', () => {
    const config1: GlobalNotificationConfig = {
        key: 'KEY1',
        type: NOTIFICATIONTYPES.INFO,
        title: 'This is a test 1',
    };

    const config2: GlobalNotificationConfig = {
        key: 'KEY2',
        type: NOTIFICATIONTYPES.INFO,
        title: 'This is a test 2',
    };

    it('should add notification', () => {
        const testState = notificationList([config1], {
            type: GLOBAL_NOTIFICATION.ADD,
            payload: config2,
        });

        expect(testState).toContainEqual(config1);
        expect(testState).toContainEqual(config2);
    });

    it('should not add existing key', () => {
        const testState = notificationList([config1, config2], {
            type: GLOBAL_NOTIFICATION.ADD,
            payload: config1,
        });

        expect(testState.length).toEqual(2);
    });

    it('should remove notification by key', () => {
        const testState1 = notificationList([config1, config2], {
            type: GLOBAL_NOTIFICATION.REMOVE,
            key: 'KEY1',
        });
        expect(testState1.length).toEqual(1);

        const testState2 = notificationList([config2], {
            type: GLOBAL_NOTIFICATION.REMOVE,
            key: 'KEY1',
        });
        expect(testState2.length).toEqual(1);
    });
});
