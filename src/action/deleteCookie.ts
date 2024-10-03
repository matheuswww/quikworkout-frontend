'use server';

import { cookies } from 'next/headers';

export async function deleteCookie(key: string) {
 cookies().delete({
  name: key,
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 0,
  path: "/",
  });
}
