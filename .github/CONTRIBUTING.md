# Contributing

This is an initial version of the Contribution Guide.

## Code of Conduct

Before contributing to the project, please read our
[Code of Conduct](./CODE_OF_CONDUCT.md).

## Reporting an Issue

Before you submit an issue, please search [the issue tracker][issues]. An issue
for your problem might already exist and the discussion might answer your questions.

You can file new issues by [selecting an issue template][new-issue] and filling
out the necessary information.

## Proposing a Change

If you intend to change the public API, make any non-trivial changes to the
implementation, or contribute documentation, [create an issue][new-feature] first. 
This will let us discuss a proposal before you invest significant effort into it.

If you're only fixing a bug or a typo, it's fine to submit a pull request right
away without creating an issue, but make sure it contains a clear and concise
description.

## Working on Issues

Before you start working on an issue, leave a comment to let others know.

## Semantic Versioning

This project follows [semantic versioning][semver].

## Making a Pull Request

1. Fork the repo.
2. In your forked repo, create a new branch for your changes:
   ```shell
   git checkout -b my-fix-branch main
   ```
3. Update the code.
4. Commit your changes using a descriptive commit message where necessary. We strongly **discourage**
   using AI to generate commit descriptions.
   ```shell
   git commit --all
   ```
   When committing the changes, our git hooks may automatically run Prettier
   and ESLint for you. If they are not configured or supported in your
   working environement, you can run these tools using `npm run format`
   and `npm run lint` respectively.
5. Push your branch to GitHub:
   ```shell
   git push origin my-fix-branch
   ```
6. In GitHub, send a pull request to [the main branch][main]. Request reviews where required.

### Continuous Integration

After you made a pull request, a GitHub workflow will be dispatched to verify it.

### Addressing Feedback

1. Make required updates to the code.
2. Create a fixup commit and push it to your GitHub repo:
   ```shell
   git commit --all --fixup HEAD
   git push
   ```

## Using generative AI

Use generative AI to enhance your work, not replace it. For for example, to help you write code and documentation.

## Attribution

This Contribution Guide was inspired by [Motion Canvas][motion-canvas].

[main]: https://github.com/epreston/renderlayer/tree/main
[issues]: https://github.com/epreston/renderlayer/issues
[new-issue]: https://github.com/epreston/renderlayer/issues/new
[new-feature]: https://github.com/epreston/renderlayer/issues/new

[semver]: https://semver.org/
[motion-canvas]: https://github.com/motion-canvas/motion-canvas
