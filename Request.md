Upgrade GlobalStore implementation to production-safe architecture.

Requirements:

1. Add persistence layer:
   - Memory store
   - sessionStorage fallback
   - restore state on app load

2. Implement subscription lifecycle:
   - subscribe must return unsubscribe function
   - page destroy must cleanup listeners

3. Add backend sync as source of truth:
   - on page load fetch real state
   - reconcile with local store

4. Prevent memory leaks:
   - store must not hold DOM references
   - store must only contain serializable data

5. Add debug safety:
   - expose window.__STORE_DEBUG__
   - allow manual inspection

Constraints:
Do not change UI layout.
Do not rewrite entire app.
Only improve store reliability.

Output only modified code.