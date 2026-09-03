# CS Têxtil — Gestão de Tingimentos

Versão 2 integrada ao Supabase.

## Executar

1. Instale Node.js 18 ou superior.
2. Na pasta do projeto, execute `npm start`.
3. Abra `http://localhost:3000`.

O navegador precisa de acesso à internet para autenticar e consultar o Supabase.

## Perfis de acesso

- `admin`: acesso completo e exclusões.
- `employee`: operação de clientes, pedidos, HTS e conclusão.
- `client`: visualiza apenas a própria área e os próprios pedidos.

Clientes criam a senha em **Criar acesso** usando o mesmo e-mail cadastrado pela CS Têxtil. O banco vincula automaticamente o usuário ao cliente quando os e-mails coincidem.

## Segurança

A aplicação usa somente a chave publicável do Supabase no navegador. Não inclua chaves `secret` ou `service_role` neste repositório.

## Primeiro administrador

Crie um usuário em Supabase > Authentication > Users. Depois altere a coluna `role` desse usuário na tabela `public.profiles` para `admin`. Funcionários usam `employee`.
