import { api } from '@/api/path';
import { managerClothing } from './pathClothing';
import { pathManager } from '../pathManager';

export type createClothingResponse = 500 | 201 | 401;

interface params {
 nome: string;
 descricao: string;
 preco: number;
 categoria: string;
 sexo: string;
 ativo: boolean;
 material: string;
 imagem: Blob[];
 inventario: string[];
}

export default async function CreateClothing(
 cookie: string,
 params: params,
): Promise<createClothingResponse> {
 const url = api + pathManager + managerClothing + '/createClothing';
 const formData = new FormData();
 formData.append('nome', params.nome);
 formData.append('descricao', params.descricao);
 formData.append('preco', params.preco.toString());
 formData.append('categoria', params.categoria);
 formData.append('sexo', params.sexo);
 formData.append('ativo', 'true');
 formData.append('material', params.material);
 params.imagem.map((i) => {
  formData.append('imagem', i);
 });
 params.inventario.map((i) => {
  formData.append('inventario', i);
 });
 try {
  let status: number = 0;
  await fetch(url, {
   method: 'POST',
   headers: {
    Cookie: cookie,
   },
   credentials: 'include',
   body: formData,
  }).then((res) => {
   status = res.status;
  });
  if (status == 201 || status == 401) {
   return status;
  }
  return 500;
 } catch (err) {
  console.error('error trying createClothing:', err);
  return 500;
 }
}
