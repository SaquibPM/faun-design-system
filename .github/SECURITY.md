# Security policy

Faun ships styles, tokens and UI components and handles no data itself. Vulnerabilities are still possible, for example a component that renders untrusted content unsafely or a vulnerable dependency.

## Reporting

Report privately through GitHub's **Report a vulnerability** button on the Security tab. Please do not open a public issue. Include the affected package and version, a description of the impact and, if possible, a reproduction.

We acknowledge reports within three working days and aim to provide a fix or mitigation plan within 30 days.

## Supported versions

The latest minor release of each package receives security fixes.

## Supply chain

Releases are published from CI with npm provenance. Dependencies are monitored with Dependabot.
