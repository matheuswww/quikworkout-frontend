import { api } from '../path';
import { userPath } from './userPath';

export interface getUserResponse {
 data: data | null;
 status: statusGetUser;
}

type statusGetUser = 200 | 404 | 500 | 401;

interface data {
 nome: string;
 email: string;
 twoAuthEmail: string;
 verificado: boolean;
}

export default async function GetUser(
 cookie: string,
): Promise<getUserResponse> {
 let url = api;
 url += '/' + userPath + '/getUser';
 try {
  let status: number = 0;
  const res: data | null = await fetch(url, {
   method: 'GET',
   headers: {
    'Content-Type': 'application/json',
    Cookie: cookie,
   },
   credentials: 'include',
   cache: 'no-cache',
  }).then((res) => {
   status = res.status;
   if (status == 200) {
    return res.json();
   }
  });
  if (status === 200) {
   return {
    data: res,
    status,
   };
  }
  if (status === 404 || status === 500 || status === 401) {
   return {
    data: null,
    status,
   };
  }
  return {
   data: null,
   status: 500,
  };
 } catch (err) {
  console.error('error trying getUser:', err);
  return {
   data: null,
   status: 500,
  };
 }
}
