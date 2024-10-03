'use server';

import { cookies } from 'next/headers';

export async function deleteCookie(key: string) {
 'use server';
 cookies().set({
  name: key,
  value: '',
  expires: new Date('2000-01-01'),
  path: '/',
})
}
