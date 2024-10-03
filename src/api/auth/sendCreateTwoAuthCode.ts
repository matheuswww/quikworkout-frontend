import { api } from '../path';
import { ResponseErr } from '../responseErr';
import { twoAuthPath } from '../user/userPath';

export type sendCreateTwoAuthCodeResponse =
 | 'usuário já possui autenticação de dois fatores'
 | 'usuário não é verificado'
 | 'seu código foi gerado porem não foi possivel criar uma sessão'
 | 'senha errada'
 | 500
 | 200
 | 401;

interface params {
 email: string;
 senha: string;
}

export default async function SendCreateTwoAuthCode(
 cookie: string,
 params: params,
): Promise<sendCreateTwoAuthCodeResponse> {
 let url = api;
 url += '/' + twoAuthPath + '/sendCreateTwoAuthCode';
 try {
  let status: number = 0;
  const res: ResponseErr | null = await fetch(url, {
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
  if (status == 200 || status == 401 || status == 500) {
   return status;
  }
  let msg: sendCreateTwoAuthCodeResponse | null = null;
  if (
   res?.message == 'usuário já possui autenticação de dois fatores' ||
   res?.message == 'usuário não é verificado' ||
   res?.message == 'senha errada' ||
   res?.message ==
    'seu código foi gerado porem não foi possivel criar uma sessão'
  ) {
   msg = res?.message;
  }
  if (msg != null) {
   return msg;
  }
  return 500;
 } catch (err) {
  console.error('error trying sendCreateTwoAuthCode:', err);
  return 500;
 }
}
