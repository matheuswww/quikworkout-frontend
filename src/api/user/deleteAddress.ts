import { api } from '../path';
import { userPath } from './userPath';

type statusgetAdress = 200 | 404 | 500 | 401;

interface address {
 rua: string;
 numeroResidencia: string;
 complemento: string;
 bairro: string;
 cidade: string;
 codigoRegiao: string;
 cep: string;
}

export default async function DeleteAddress(
 cookie: string,
 address: address,
): Promise<statusgetAdress> {
 let url = api;
 url += '/' + userPath + '/deleteAddress';
 try {
  let status: number = 0;
  await fetch(url, {
   method: 'DELETE',
   headers: {
    'Content-Type': 'application/json',
    Cookie: cookie,
   },
   credentials: 'include',
   body: JSON.stringify(address),
  }).then((res) => {
   status = res.status;
  });

  if (status === 404 || status === 500 || status === 401 || status == 200) {
   return status;
  }
  return 500;
 } catch (err) {
  console.error('error trying Delete:', err);
  return 500;
 }
}
