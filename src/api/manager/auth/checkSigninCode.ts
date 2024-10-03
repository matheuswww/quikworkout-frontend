import { api } from '@/api/path';
import { pathManager } from '../pathManager';
import { managerAuth } from './managerAuth';
import { ResponseErr } from '@/api/responseErr';

export type checkSigninCode =
 | 'maximo de tentativas atingido'
 | 'código inválido'
 | 'código expirado'
 | 'cookie inválido'
 | 'código valido porém não foi possivel criar uma sessão'
 | 'você não possui um código registrado'
 | 'recaptcha inválido'
 | 500
 | 200
 | 401;

interface params {
 codigo: string;
 token: string;
}

export default async function CheckSigninCode(
 cookie: string,
 params: params,
): Promise<checkSigninCode> {
 let url = api;
 url += pathManager + managerAuth + '/checkSigninCode';
 try {
  let status: number = 0;
  const res: ResponseErr = await fetch(url, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    Cookie: cookie,
   },
   credentials: 'include',
   body: JSON.stringify(params),
  }).then((res) => {
   status = res.status;
   if (status != 200) {
    return res.json();
   }
  });
  if (status == 200 || status == 500 || status == 401) {
   return status;
  }
  let msg: checkSigninCode | null = null;
  if (
   res.message == 'maximo de tentativas atingido' ||
   res.message == 'código inválido' ||
   res.message == 'código expirado' ||
   res.message == 'código valido porém não foi possivel criar uma sessão' ||
   res.message == 'código inválido' ||
   res.message == 'você não possui um código registrado' ||
   res.message == 'recaptcha inválido'
  ) {
   msg = res.message;
  }
  if (msg != null) {
   return msg;
  }
  return 500;
 } catch (err) {
  console.error('error trying CheckSigninCode:', err);
  return 500;
 }
}
