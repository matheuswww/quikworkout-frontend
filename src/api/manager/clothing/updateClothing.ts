import { api } from '@/api/path';
import { managerClothing } from './pathClothing';
import { pathManager } from '../pathManager';

export interface updateClothingParams {
 id: string;
 nome?: string;
 descricao?: string;
 preco?: number;
 categoria?: string;
 sexo?: string;
 material?: string;
 active?: boolean;
}

type updateClothing = 401 | 404 | 500 | 200;

export default async function UpdateClothing(
 cookie: string,
 params: updateClothingParams,
): Promise<updateClothing> {
 const url = api + pathManager + managerClothing + '/' + 'updateClothing';
 try {
  const res: number = await fetch(url, {
   method: 'PATCH',
   headers: {
    'Content-Type': 'application/json',
    Cookie: cookie,
   },
   credentials: 'include',
   body: JSON.stringify(params),
  }).then((res) => {
   return res.status;
  });
  if (res == 200 || res == 401 || res == 500 || res == 404) {
   return res;
  }
  return 500;
 } catch (err) {
  console.error('error trying updateClothing:', err);
  return 500;
 }
}
