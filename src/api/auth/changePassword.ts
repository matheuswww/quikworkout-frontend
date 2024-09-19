import { api } from '../path';
import { ResponseErr } from '../responseErr';
import { authPath } from '../user/userPath';

export type changePassword =
 | 'cookie inválido'
 | 'senha errada'
 | 'as senhas são as mesmas'
 | 'recaptcha inválido'
 | 500
 | 200
 | 401;

interface params {
 senhaNova: string;
 senhaAntiga: string;
 token: string;
}

export default async function ChangePassword(
 cookie: string,
 params: params,
): Promise<changePassword> {
 let url = api;
 url += '/' + authPath + '/changePassword';
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
  let msg: changePassword | null = null;
  if (
   res.message == 'cookie inválido' ||
   res.message == 'senha errada' ||
   res.message == 'as senhas são as mesmas' ||
   res.message == 'recaptcha inválido'
  ) {
   msg = res.message;
  }
  if (msg != null) {
   return msg;
  }
  return 500;
 } catch (err) {
  console.error('error trying ChangePassword:', err);
  return 500;
 }
}
