import { pathManager } from '../pathManager';
import { managerAuth } from './managerAuth';

export interface getUserResponse {
 data: data | null;
 status: statusGetAdmin;
}

type statusGetAdmin = 200 | 500 | 401;

interface data {
 nome: string;
 email: string;
}

export default async function GetAdmin(
 cookie: string,
): Promise<getUserResponse> {
 let url = pathManager;
 url += '/' + managerAuth + '/getUser';
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
  if (status === 500 || status === 401) {
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
  console.error('error trying getAdmin:', err);
  return {
   data: null,
   status: 500,
  };
 }
}
