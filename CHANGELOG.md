# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.1.0 (2025-04-13)

### Features

* add dependabot configuration for automated npm dependency updates ([6e11255](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/6e112554fe53750919bfa4ec2910d3a9ea4f345a))
* Add Google authentication functionality ([37f6a6b](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/37f6a6b201d2fecc22c58a8a81312aafd9cd985f))
* add slug generation utility and enhance pagination options with populate support ([8d7c48f](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/8d7c48f2f663d041f524892596f06f3e0d48e29f))
* add url shorten functionality ([facda21](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/facda21ebded00c8f59ef00601b3b55932c406c1))
* add user validation and update user input structure ([42570d9](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/42570d91b2d5ca2498b5ade26f1f290bfea2380b))
* **email:** refactor email sending functionality and add password change confirmation email ([d8c5f8c](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/d8c5f8c90dfbbdbe1600a86bd92075d4b153357b))
* Enhance email providers to support attachments and improve payload structures ([fd5bbd3](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/fd5bbd3598730d0567d92ece82ca1f69e089a59f))
* enhance pagination utility with next/previous page indicators and improved filter typing ([7f148a0](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/7f148a064e89b4f335156b03bca91329dcffb5e5))
* enhance pagination utility with sorting options and improve query filtering ([69e7677](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/69e767712574889e47832fa8b075913320a22e9b))
* implement basic auth with roles ([baa1c2d](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/baa1c2dd85f95a66fe7f3594a6adeecaf8f3be16))
* implement pagination for user queries and enable API key validation ([c9807cc](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/c9807cc471f204d0ec3bf98bd21608aa67f71571))
* Refactor email sending functionality to support multiple providers (Nodemailer, ZeptoMail, Resend) ([d7a0d23](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/d7a0d230e035245f98a89981718a16d3ad61c7aa))
* refactor user model to enhance static methods and improve type definitions ([1471854](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/1471854198df607f695e1dee0c0011cafb920675))
* update .env.example and README.md with environment variable configurations and project structure ([1ed1914](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/1ed19140dc8327df3628a7a8259f7d009e59fed2))
* update token utility to use SignOptions for token duration parameters ([5b6d9ab](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/5b6d9ab7a493832f0583e64cc3e7d6eb031bb791))

### Bug Fixes

* Add password reset mutation to resolvers ([56f6dc9](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/56f6dc984d6e09c328e246796642256db0f03b6f))
* get user from token and pass to context ([863e310](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/863e310afe20b227e283827adc49ad107f4db2f4))

### Code Refactoring

* Improve mail logo styling in email template ([ec6e19f](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/ec6e19f331158d5b77325f8ecb0719c6d4d98ee0))
* Update Dockerfile and docker-compose.yml ([e19cda3](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/e19cda3dcd942f666f4952b31d62657f79c270ff))

### Chores

* Add API key functionality to GraphQL schema and resolvers ([e517e20](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/e517e20c77377e002cdfe80a41531c859090df6c))
* Add Docker configuration files and scripts for production and development environments ([7d23eb3](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/7d23eb31bf59dddb783ef7bd25f195c10b19ecc7))
* Add OTP functionality to user registration process ([342d9ab](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/342d9ab6badb04ea043bcf55da977930f0ccd6d9))
* add scripts for conventional commits and changelog generation ([82ea006](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/82ea0064c4826662d37ee61f862b49b379585e0a))
* **deps-dev:** bump the development-dependencies group with 3 updates ([6bbf817](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/6bbf817ca33d028f389d1c6d0bc6242eed0d8070))
* **deps:** bump the production-dependencies group with 6 updates ([7ae0329](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/7ae032931c81e9991c9270ac71b2eb6be277de94))
* enable introspection in ApolloServer configuration ([fd33871](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/fd33871d45f73aa9ee58c45f06f48f8c9f642f63))
* Refactor middleware order and add API key validation ([797e5c6](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/797e5c65b01a1970503dc6450202b9f13caeb20c))
* Remove  URL-related code ([55f4595](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/55f45950923153c31822078ae7f87c0a5744c17e))
* Remove console.log statements from resolvers ([4a9e768](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/4a9e7682bb817e11b7d3f77171d79417f8450604))
* Update API key middleware to allow OPTIONS requests ([0ff436b](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/0ff436b7f6091e67f41dfff69f8fd3e2b8edd3b7))
* update commit-msg hook and add commitlint configuration ([737f1f5](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/737f1f5afc45270dc47f34f1031bddc54da22a32))
* update package name to express-ts-graphql-starter ([4e0689c](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/4e0689c312466398e583bc9b9246d315a5162ab7))
* update package name to nano-console-api ([cec2807](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/cec280787e46d3dde4d97a43fb8e20baf6e3df9b))
* update package.json dependencies and devDependencies to latest versions; fix filter type in paginate utility ([a4a39dd](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/a4a39dd53a85dbb2cbbdbd38bb7a8a4ad4e6e919))
* Update role model and user typeDefs ([fd51836](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/fd51836e48d918dabe8673c920fa90af2a33ce32))
* update TypeScript configuration and dependencies to latest versions ([a07dd0b](https://github.com/miracleonyenma/express-ts-graphql-starter/commit/a07dd0b4fe04d83f4a64e70cbe2f79b7ed148ea1))
