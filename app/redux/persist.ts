import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';
export function persist(key: string, whitelist: string[], reducer: any) {
    return persistReducer({
        key,
        storage: AsyncStorage,
        whitelist,
    }, reducer);
}