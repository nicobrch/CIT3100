# t3-emergentes

1. **Dependencias**

```shell
powershell -c "irm bun.sh/install.ps1 | iex" # Windows
curl -fsSL https://bun.sh/install | bash # Linux
bun install
```

2. **Inicializar base de datos**

```shell
cat init.sql | sqlite3 sqlite.db
bun seed.ts
```

3. **Ejecutar API**

```shell
bun index.ts # Ejecucion normal
bun dev # Ejecucion con hot reload
```