import { api } from '@/api/path';
import { pathManager } from '../pathManager';
import { managerProfile } from './pathProfile';
import { ResponseErr } from '@/api/responseErr';

export interface params {
 pedido_id: string;
 pacotes: packages[];
}

export interface packages {
 numeroPacote: number;
 codigoRastreio: string;
}

type updateTrackingCode = 401 | 404 | 500 | 200 | "código já existe";

export default async function UpdateTrackingCode(
 cookie: string,
 params: params,
): Promise<updateTrackingCode> {
 const url = api + pathManager + managerProfile + '/' + 'updateTrackingCode';
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
  if (res?.message == "código já existe") {
    return res.message
  }
  if (status == 200 || status == 401 || status == 500 || status == 404) {
   return status;
  }
  return 500;
 } catch (err) {
  console.error('error trying updateTrackingCode:', err);
  return 500;
 }
}
