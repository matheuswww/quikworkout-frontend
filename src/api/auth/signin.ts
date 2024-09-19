import { api } from '../path';
import { ResponseErr } from '../responseErr';
import { authPath } from '../user/userPath';

interface params {
 email: string;
 senha: string;
 token: string;
}

interface singninResponeSuccess {
 twoAuth: boolean;
}

export type signinResponse =
 | 'contato não cadastrado'
 | 'senha errada'
 | 'recaptcha inválido'
 | singninResponeSuccess
 | 500;

export default async function Signin(params: params): Promise<signinResponse> {
 let url = api;
 url += '/' + authPath + '/signin';
 let status: number = 0;
 try {
  const res: ResponseErr | singninResponeSuccess = await fetch(url, {
   method: 'POST',
   headers: {
    'Content-Type': 'application/json',
   },
   credentials: 'include',
   body: JSON.stringify(params),
  }).then((res) => {
   status = res.status;
   return res.json();
  });
  if (
   'message' in res &&
   (res.message == 'contato não cadastrado' ||
    res.message == 'senha errada' ||
    res.message == 'recaptcha inválido')
  ) {
   return res.message;
  }
  if ('twoAuth' in res) {
   return res;
  }
  if (status == 500) {
   return status;
  }
  return 500;
 } catch (err) {
  console.error('error trying signin:', err);
  return 500;
 }
}
