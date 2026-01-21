import 'next-auth';
import 'next-auth/jwt';
import type { Role } from '@fidevoltz/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: Role;
      avatar: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    avatar: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    avatar: string | null;
  }
}
