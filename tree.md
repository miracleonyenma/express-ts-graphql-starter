.
├── CHANGELOG.md
├── commitlint.config.mjs
├── docker-compose.yml
├── Dockerfile
├── nodemon.json
├── package-lock.json
├── package.json
├── prisma
│   ├── migrations
│   │   └── 20251201184800_enable_rls
│   │       └── migration.sql
│   └── schema.prisma
├── prisma.config.ts
├── README.md
├── src
│   ├── config
│   │   ├── auth.config.ts
│   │   ├── db.ts
│   │   └── prisma.ts
│   ├── controllers
│   │   └── auth.controller.ts
│   ├── generated
│   │   └── prisma
│   │       ├── browser.ts
│   │       ├── client.ts
│   │       ├── commonInputTypes.ts
│   │       ├── enums.ts
│   │       ├── internal
│   │       │   ├── class.ts
│   │       │   ├── prismaNamespace.ts
│   │       │   └── prismaNamespaceBrowser.ts
│   │       ├── libquery_engine-darwin.dylib.node
│   │       ├── models
│   │       │   ├── ApiKey.ts
│   │       │   ├── File.ts
│   │       │   ├── MagicLinkToken.ts
│   │       │   ├── Otp.ts
│   │       │   ├── PasswordResetToken.ts
│   │       │   ├── Role.ts
│   │       │   └── User.ts
│   │       └── models.ts
│   ├── graphql
│   │   ├── resolvers
│   │   │   ├── apiKey.resolvers.ts
│   │   │   ├── google.auth.resolvers.ts
│   │   │   ├── index.ts
│   │   │   ├── magicLink.resolvers.ts
│   │   │   ├── otp.resolvers.ts
│   │   │   ├── passwordReset.resolvers.ts
│   │   │   ├── role.resolvers.ts
│   │   │   └── user.resolvers.ts
│   │   └── typeDefs
│   │       ├── apiKey.ts
│   │       ├── google.auth.ts
│   │       ├── index.ts
│   │       ├── magicLink.ts
│   │       ├── otp.ts
│   │       ├── passwordReset.ts
│   │       ├── role.ts
│   │       └── user.ts
│   ├── index.ts
│   ├── jobs
│   ├── middlewares
│   │   ├── apiKey.middleware.ts
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── routes
│   │   ├── auth.routes.ts
│   │   └── s3.routes.ts
│   ├── scripts
│   │   └── enable-rls.ts
│   ├── services
│   │   ├── error.services.ts
│   │   ├── file.service.ts
│   │   ├── google.auth.services.ts
│   │   ├── magicLink.services.ts
│   │   ├── otp.services.ts
│   │   ├── passwordResetToken.services.ts
│   │   ├── role.services.ts
│   │   ├── s3.service.ts
│   │   └── user.services.ts
│   ├── types
│   │   └── user.ts
│   └── utils
│       ├── emails
│       │   ├── index.ts
│       │   └── mail.ts
│       ├── filters
│       │   ├── file.ts
│       │   ├── index.ts
│       │   └── user.ts
│       ├── generateSlug.ts
│       ├── numberFormatter.ts
│       ├── paginate.ts
│       ├── token.ts
│       ├── url.ts
│       └── user.ts
├── tree.md
└── tsconfig.json

23 directories, 78 files
