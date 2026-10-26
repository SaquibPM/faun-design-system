# Governance

## Roles

- **Users** use Faun in products and file issues.
- **Contributors** send pull requests, docs, issues and reviews.
- **Maintainers** review and merge, triage issues, and cut releases. They are listed in [CODEOWNERS](../.github/CODEOWNERS).
- **Design leads** own the visual language, the tokens and the accessibility bar. They have the final say on changes to either.

## Decisions

- Day-to-day changes are decided in pull requests by lazy consensus: a change that has a maintainer approval and no unresolved objection after two working days may merge.
- Changes to public API, token names, the visual language or the accessibility contract need two maintainer approvals, one of them a design lead, and an ADR in `docs/adr`.
- Disagreements are resolved by the design leads, who record the reasoning in the ADR.

## Becoming a maintainer

Contributors with a sustained record of high-quality changes and reviews can be nominated by any maintainer and are added by consensus of the existing maintainers.

## Releases

Releases are cut from `main` by the release workflow using Changesets. Packages follow semantic versioning. Deprecations ship in a minor release with a documented replacement and are removed no sooner than the next major.

## Principles

1. Accessibility is not negotiable.
2. Roles over values: components speak in semantic tokens.
3. One way to do a thing.
4. The documentation is part of the product.
