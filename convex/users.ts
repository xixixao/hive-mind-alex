import { MutationCtx, QueryCtx } from './_generated/server'

export async function maybeCreateCurrentUser(ctx: MutationCtx) {
  const { db, auth } = ctx
  const identity = await auth.getUserIdentity()
  console.log(identity)
  if (!identity) {
    throw new Error(
      'Called maybeCreateCurrentUser without authentication present'
    )
  }
  const user = await getCurrentUser(ctx)
  if (user !== null) {
    // If we've seen this identity before but the name has changed, patch the value.
    if (user.name != identity.name) {
      await db.patch(user._id, { name: identity.name })
    }
    return user._id
  }
  // If it's a new identity, create a new `User`.
  await db.insert('users', {
    name: identity.name || '',
    tokenIdentifier: identity.tokenIdentifier,
  })
}

export async function getCurrentUser({ db, auth }: QueryCtx) {
  const identity = await auth.getUserIdentity()
  if (!identity) {
    throw new Error('Called getCurrentUser without authentication present')
  }
  return await db
    .query('users')
    .withIndex('by_token', (q) =>
      q.eq('tokenIdentifier', identity.tokenIdentifier)
    )
    .unique()
}
