'use server';

import { cookies } from 'next/headers';

export async function deleteCookie(key: string) {
 'use server';
 cookies().delete(key);
}
