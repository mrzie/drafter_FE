// import { flat } from '../utils'

// export interface Exception {
//     code: number,
//     msg: string,
//     raw?: any,
//     remark?: string,
// }

// export interface SimpleMessage {
//     code: number,
//     msg: string,
// }

// const TYPE_ERROR
//     : (err: TypeError) => Exception
//     = (err: TypeError) => ({ code: 900, msg: err.message, raw: err });

// const REJECT_ERROR = (err: Exception) => Promise.reject(err);
// const REJECT_TYPE_ERROR = (err: TypeError) => REJECT_ERROR(TYPE_ERROR(err));

// const prefix = '/v1';
// const _unprefixed_fetch = (info: RequestInfo, init?: RequestInit) => {
//     return fetch(info, init).then(async res => {
//         if (!res.ok) {
//             return REJECT_ERROR(await res.json());
//         }
//         return res.json();
//     }, REJECT_TYPE_ERROR);
// };

// const _fetch = (info: RequestInfo, init?: RequestInit) => _unprefixed_fetch(prefix + info, init);

// export const login
//     : (password: string, exclusive: boolean) => Promise<[SimpleMessage, any]>
//     = (password, exclusive) => flat(_fetch('/login', { body: { password, exclusive }, method: 'POST' }));

// export const editPassword
//     : (newPassword: string, oldPassword: string) => Promise<[SimpleMessage, any]> 
//     = (newPassword, oldPassword) => flat(_fetch('/admin/editpassword'))