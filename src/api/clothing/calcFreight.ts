import { api } from '../path';
import { ResponseErr } from '../responseErr';
import { clothingPath } from './clothingPath';

export interface calcFreightResponse {
 status: statusCode;
 data: calcFreightData | responseErrors | null;
}

type statusCode = 500 | 200 | 401 | 400;

type responseErrors =
 | 'cep de destino inválido'
 | 'frete não disponível'
 | 'roupa não encontrada'
 | 'peso maxímo atingido'
 | 'cubagem excedida';

export interface calcFreightData {
 vlrFrete: number;
 prazoEnt: number;
 transport: string;
}

interface params {
 roupa: string[];
 quantidadeProduto: number[];
 cep: string;
 servico: 'E' | 'X' | 'R';
}

export default async function CalcFreight(
 params: params,
): Promise<calcFreightResponse> {
 if (params.roupa.length != params.quantidadeProduto.length) {
  return {
   data: null,
   status: 500,
  };
 }
 let url = api;
 url += clothingPath + '/calcFreight';
 params.roupa.map((id, i) => {
  if (i == 0) {
   url += '?roupa=' + id + '&quantidadeProduto=' + params.quantidadeProduto[i];
  } else {
   url += '&roupa=' + id + '&quantidadeProduto=' + params.quantidadeProduto[i];
  }
 });
 url += '&cep=' + params.cep + '&servico=' + params.servico;
 try {
  let status: number = 0;
  const res: ResponseErr | calcFreightData | null = await fetch(url, {
   method: 'GET',
   headers: {
    'Content-Type': 'application/json',
   },
   cache: 'no-store',
  }).then((res) => {
   status = res.status;
   return res.json();
  });
  if (status == 200 && res && 'vlrFrete' in res) {
   return {
    data: res,
    status: status,
   };
  }
  if (
   res &&
   'message' in res &&
   (res.message == 'cep de destino inválido' ||
    res.message == 'frete não disponível' ||
    res.message == 'roupa não encontrada' ||
    res.message == 'peso maxímo atingido' ||
    res.message == 'cubagem excedida')
  ) {
   return {
    data: res.message,
    status: 400,
   };
  } else if (status == 401 || status == 500) {
   return {
    data: null,
    status: status,
   };
  }
  return {
   status: 500,
   data: null,
  };
 } catch (err) {
  console.error('error trying CalcFreight:', err);
  return {
   status: 500,
   data: null,
  };
 }
}
