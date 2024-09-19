import { api } from '../path';
import { ResponseErr } from '../responseErr';
import { twoAuthPath } from '../user/userPath';

export type checkRemoveTwoAuthCodeResponse =
 | 'máximo de tentativas atingido'
 | 'usuário não possui autenticação de dois fatores'
 | 'código expirado'
 | 'código inválido'
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

export default async function CheckRemoveTwoAuthCode(
 cookie: string,
 params: params,
): Promise<checkRemoveTwoAuthCodeResponse> {
 let url = api;
 url += '/' + twoAuthPath + '/checkRemoveTwoAuthCode';
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
  let msg: checkRemoveTwoAuthCodeResponse | null = null;
  if (
   res.message == 'máximo de tentativas atingido' ||
   res.message == 'código inválido' ||
   res.message == 'código expirado' ||
   res.message == 'código valido porém não foi possivel criar uma sessão' ||
   res.message == 'usuário não possui autenticação de dois fatores' ||
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
  console.error('error trying validateCode:', err);
  return 500;
 }
}
