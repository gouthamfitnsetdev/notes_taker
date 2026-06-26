const fs = require('fs');

const content = `export const environment = {
  supabaseUrl: '${process.env.SUPABASE_URL ?? ''}',
  supabaseKey: '${process.env.SUPABASE_KEY ?? ''}',
};
`;

fs.writeFileSync('./src/environments/environment.ts', content);
console.log('✓ environment.ts generated from env vars');
