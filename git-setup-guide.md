# Guia para Configurar Git e Subir no GitHub

## Passo 1: Resolver problema de propriedade do diretório
Execute no PowerShell como Administrador:
```powershell
git config --global --add safe.directory "D:/LEAD/nextacademyforms-68"
```

## Passo 2: Configurar sua conta do Git
```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

## Passo 3: Verificar status do repositório
```powershell
cd "D:\LEAD\nextacademyforms-68"
git status
```

## Passo 4: Adicionar arquivos e fazer commit
```powershell
git add .
git commit -m "feat: Refatoração completa do projeto Next Academy Forms

- Remove componente duplicado AthleteInfoForm.tsx
- Cria interface única AthleteInfo em types/index.ts
- Configura TypeScript strict mode
- Adiciona sistema de logging estruturado
- Implementa validação com Zod
- Melhora tratamento de erros com retry
- Configura variáveis de ambiente
- Atualiza URLs de webhook
- Adiciona documentação completa
- Resolve conflitos de dependências"
```

## Passo 5: Criar repositório no GitHub
1. Acesse https://github.com
2. Clique em "New repository"
3. Nome: `nextacademyforms-68`
4. Descrição: "Sistema de qualificação e agendamento para atletas da Next Academy"
5. Marque como "Public" ou "Private" conforme preferir
6. NÃO inicialize com README (já temos um)
7. Clique em "Create repository"

## Passo 6: Conectar repositório local ao GitHub
```powershell
git remote add origin https://github.com/SEU_USUARIO/nextacademyforms-68.git
git branch -M main
git push -u origin main
```

## Passo 7: Verificar se funcionou
```powershell
git remote -v
git log --oneline -5
```

## Problemas Comuns:

### Se der erro de autenticação:
- Use Personal Access Token em vez de senha
- Configure: `git config --global credential.helper manager-core`

### Se der erro de branch:
```powershell
git checkout -b main
git push -u origin main
```

### Se der erro de merge:
```powershell
git pull origin main --allow-unrelated-histories
git push origin main
```
