import { api } from '@/api/path';
import { managerClothing } from './pathClothing';
import { pathManager } from '../pathManager';

export interface updateInventory {
 cor: string;
 imgDesc: string;
 corPrincipal: boolean;
 p: number;
 m: number;
 g: number;
 gg: number;
}

export interface updateClothingInventoryParams {
 id: string;
 novoNomeCor?: Array<string>;
 atualizarInventario: Array<string>;
}

type updateClothingInventory = 401 | 404 | 500 | 200;

export default async function UpdateClothingInventory(
 cookie: string,
 params: updateClothingInventoryParams,
): Promise<updateClothingInventory> {
 const url =
  api + pathManager + managerClothing + '/' + 'updateClothingInventory';
 const formData = new FormData();
 formData.append('id', params.id);
 params.atualizarInventario.map((i) => {
  formData.append('atualizarInventario', i);
 });
 params.novoNomeCor?.map((v) => {
  formData.append('novoNomeCor', v);
 });
 try {
  const res: number = await fetch(url, {
   method: 'PATCH',
   headers: {
    Cookie: cookie,
   },
   credentials: 'include',
   body: formData,
  }).then((res) => {
   return res.status;
  });

  if (res == 200 || res == 401 || res == 500 || res == 404) {
   return res;
  }
  return 500;
 } catch (err) {
  console.error('error trying updateClothingInventory:', err);
  return 500;
 }
}
