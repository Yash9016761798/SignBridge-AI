# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within SignBridge AI, please send an email to
security@signbridge.ai. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

## Disclosure Policy

When the security team receives a security bug report, they will assign it to a primary handler.
This person will coordinate the fix and release process, involving the following steps:

1. Confirm the problem and determine the affected versions.
2. Audit code to find any potential similar problems.
3. Prepare fixes for all releases still under maintenance.
4. Release new security version.

## Security Update Process

1. Vulnerability is reported and confirmed
2. Fix is developed and tested
3. Security advisory is drafted
4. Fix is released
5. Public disclosure is made

## Security Considerations

### Authentication

- Firebase Authentication for user identity
- JWT tokens for API authorization
- Secure token storage on client

### Data Protection

- HTTPS everywhere
- Encrypted secrets in environment variables
- No sensitive data in logs
- Regular security audits

### API Security

- Rate limiting on all endpoints
- Input validation on all requests
- CORS restrictions
- Helmet headers for security

### Database

- Encrypted connections (SSL)
- Role-based access control
- Regular backups
- No direct public access

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Security Best Practices

### For Developers

1. Never commit secrets to version control
2. Use environment variables for configuration
3. Validate all user inputs
4. Use parameterized queries
5. Keep dependencies updated
6. Follow the principle of least privilege

### For Users

1. Use strong, unique passwords
2. Enable two-factor authentication when available
3. Keep your browser and devices updated
4. Report suspicious activity immediately

## Contact

For security inquiries, please contact:

- Email: security@signbridge.ai
- GitHub Security Advisories
