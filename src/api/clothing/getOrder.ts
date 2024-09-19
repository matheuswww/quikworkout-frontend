import { api } from '../path';
import { ResponseErr } from '../responseErr';
import { clothingPath } from './clothingPath';

type statusCode = 404 | 200 | 500 | 401 | 400;

type responseErrors = 'cookie inválido' | 'contato não verificado';

export interface getOrderResponse {
 status: statusCode;
 data: getOrder[] | responseErrors | null;
}

export default async function GetOrder(
 cookie: string,
 cursor?: string,
): Promise<getOrderResponse> {
 let url = api;
 url += clothingPath + '/getOrder';
 if (cursor) {
  url += '?cursor=' + cursor;
 }
 try {
  const res = await fetch(url, {
   method: 'GET',
   headers: {
    'Content-Type': 'application/json',
    Cookie: cookie,
   },
   credentials: 'include',
   cache: 'no-store',
  }).then((res) => res);
  let status: statusCode;
  if (
   res.status === 200 ||
   res.status === 404 ||
   res.status === 401 ||
   res.status === 500 ||
   res.status == 400
  ) {
   status = res.status;
  } else {
   status = 500;
  }
  let data: getOrder[] | ResponseErr | null = null;
  if (status == 200 || status == 401 || status == 400) {
   data = await res.json();
  }

  if (
   data &&
   typeof data == 'object' &&
   'message' in data &&
   (data.message == 'cookie inválido' ||
    data.message == 'contato não verificado')
  ) {
   return {
    status: status,
    data: data.message,
   };
  }

  if (data instanceof Array && 'pedido_id' in data[0]) {
   return {
    status: status,
    data: data,
   };
  }
  return {
   status: status,
   data: null,
  };
 } catch (err) {
  console.error('error trying getOrder:', err);
  return {
   status: 500,
   data: null,
  };
 }
}
