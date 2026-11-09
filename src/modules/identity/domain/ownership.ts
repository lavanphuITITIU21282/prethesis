export interface AuthenticatedPrincipal {
  readonly userId: string;
}
export interface OwnedResource {
  readonly userId: string;
}

/** This policy requires a server-authenticated principal; a request body is never an identity. */
export function assertOwnership(
  principal: AuthenticatedPrincipal | null,
  resource: OwnedResource,
): void {
  if (!principal?.userId) throw new Error('Authentication required.');
  if (principal.userId !== resource.userId) throw new Error('Access denied.');
}
