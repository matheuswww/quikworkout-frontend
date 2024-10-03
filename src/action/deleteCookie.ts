'use server';

import { cookies } from 'next/headers';

export async function deleteCookie(key: string) {
  console.log(cookies().getAll())
 cookies().delete(key);
}
