declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * Prefixo para os cookies da aplicação.
     */
    NEXT_PUBLIC_COOKIE_PREFIX: string;

    /**
     * URL do Supabase para a aplicação.
     */
    NEXT_PUBLIC_SUPABASE_URL: string;

    /**
     * Supabase Anon Key para a aplicação.
     */
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

    /**
     * Service role para a aplicação. Deve ser mantida em segredo e não 
     * exposta no frontend.
     */
    SUPABASE_SERVICE_ROLE_KEY: string;

    /**
     * URL de conexão PostgreSQL para Prisma.
     */
    DATABASE_URL: string;

    /**
     * E-mail da super administradora para seed.
     */
    SEED_SUPER_ADMIN_EMAIL?: string;

    /**
     * Senha da super administradora para seed.
     */
    SEED_SUPER_ADMIN_PASSWORD?: string;

    /**
     * URL do Supabase usada pelo seed (server-side).
     */
    SUPABASE_URL?: string;
  }
}
