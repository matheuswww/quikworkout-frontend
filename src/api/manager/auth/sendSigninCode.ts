import { api } from '@/api/path';
import { managerAuth } from './managerAuth';
import { ResponseErr } from '@/api/responseErr';
import { pathManager } from '../pathManager';

export type sendSigninCode =
 | 'código gerado porém não foi possivel gerar sua sessão'
 | 'email ou senha incorretos'
 | 'recaptcha inválido'
 | 500
 | 200;

interface params {
 email: string;
 senha: string;
 token: string;
}

export default async function SendSigninCode(
 params: params,
): Promise<sendSigninCode> {
 let url = api;
 url += pathManager + managerAuth + '/sendSigninCode';

 try {
  let status: number = 0;
  const res: ResponseErr | null = await fetch(url, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
   },
   credentials: 'include',
   body: JSON.stringify(params),
  }).then((res) => {
   status = res.status;
   if (status != 200) {
    return res.json();
   }
  });
  if (status == 200 || status == 500) {
   return status;
  }
  let msg: sendSigninCode | null = null;
  if (
   res?.message == 'código gerado porém não foi possivel gerar sua sessão' ||
   res?.message == 'email ou senha incorretos' ||
   res?.message == 'recaptcha inválido'
  ) {
   msg = res?.message;
  }
  if (msg != null) {
   return msg;
  }
  return 500;
 } catch (err) {
  console.error('error trying sendSigninCode:', err);
  return 500;
 }
}
