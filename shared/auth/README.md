# Unified Authentication System - Types and Interfaces

This directory contains all type definitions, interfaces, constants, and utilities for the unified authentication system that consolidates authentication for both `lumina-luxe-e-commerce` and `nexus-admin-console` projects.

## Overview

The unified authentication system provides:
- **Role-based access control** with three user types: Customer, Seller, and Super Admin
- **JWT-based authentication** with secure token management
- **Session management** with automatic refresh and validation
- **Type-safe interfaces** for all authentication operations
- **Comprehensive utilities** for validation, routing, and permissions

## File Structure

```
shared/auth/
├── index.ts          # Main export file - import everything from here
├── types.ts          # Core type definitions and interfaces
├── constants.ts      # Authentication constants and configuration
├── utils.ts          # Utility functions for authentication operations
└── README.md         # This documentation file
```

## Usage

### Basic Import

```typescript
import { UserRole, User, LoginCredentials, AuthContextType } from '../shared/auth';
```

### Specific Imports

```typescript
// Types and interfaces
import { Customer, Seller, SuperAdmin, AuthResult } from '../shared/auth/types';

// Constants
import { AUTH_ERROR_CODES, DEFAULT_REDIRECT_PATHS } from '../shared/auth/constants';

// Utilities
import { isCustomer, hasRouteAccess, getUserDisplayName } from '../shared/auth/utils';
```

## Core Types

### User Roles

```typescript
enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  SUPER_ADMIN = 'SUPER_ADMIN'
}
```

### User Interfaces

- **Customer**: E-commerce customers with email/password authentication
- **Seller**: Business users with seller name/company name/password authentication
- **SuperAdmin**: Platform administrators with username/password authentication

### Authentication Interfaces

- **LoginCredentials**: Flexible credentials interface supporting all three authentication methods
- **AuthResult**: Standardized authentication response with success/error handling
- **TokenPair**: JWT access and refresh token pair
- **SessionData**: Complete session information for authenticated users

## Key Features

### Type Safety
All interfaces are strictly typed to prevent runtime errors and provide excellent IDE support.

### Role-Based Access Control
Built-in support for role-based routing and permission checking.

### Security First
Designed with security best practices including:
- HTTP-only cookies for token storage
- Secure token validation
- Role-based route protection
- Comprehensive error handling

### Integration Ready
Minimal disruption to existing codebases with clear migration paths.

## Authentication Flow

1. **Login**: User selects role and provides credentials
2. **Validation**: Credentials are validated against the appropriate authentication method
3. **Token Generation**: JWT tokens are generated with role-specific claims
4. **Session Creation**: Secure session is established with HTTP-only cookies
5. **Route Protection**: Access control enforces role-based routing
6. **Token Refresh**: Automatic token refresh maintains session security

## Error Handling

Comprehensive error handling with:
- Standardized error codes
- User-friendly error messages
- Detailed error information for debugging
- Graceful fallback mechanisms

## Testing Support

All types and interfaces are designed to support both unit testing and property-based testing:
- Type guards for runtime type checking
- Validation utilities for input sanitization
- Mock-friendly interfaces for testing
- Comprehensive utility functions for test scenarios

## Migration Guide

### From Existing Projects

1. **Import the shared types**: Replace existing authentication types with shared ones
2. **Update interfaces**: Modify existing components to use the new interfaces
3. **Implement role checking**: Use the provided utilities for role-based logic
4. **Update routing**: Integrate with the new route protection system

### Example Migration

```typescript
// Before (nexus-admin-console)
import { UserRole } from './types';

// After
import { UserRole } from '../shared/auth';

// The UserRole enum is now simplified to three roles:
// CUSTOMER, SELLER, SUPER_ADMIN
```

## Best Practices

1. **Always use type guards** when working with User union types
2. **Leverage utility functions** instead of implementing custom logic
3. **Use constants** for error codes and configuration values
4. **Implement proper error handling** using the provided error interfaces
5. **Follow the authentication flow** as designed for security compliance

## Contributing

When adding new authentication features:
1. Add types to `types.ts`
2. Add constants to `constants.ts`
3. Add utilities to `utils.ts`
4. Update this README with usage examples
5. Ensure all exports are included in `index.ts`