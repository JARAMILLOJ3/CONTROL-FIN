# Security Specification & Test Protocol

## 1. Data Invariants
- Every user can ONLY read and write their own documents under `/users/{userId}`.
- Any attempt to read another user's private financial data (`/users/{otherUserId}/finance/data`) MUST be rejected with PERMISSION_DENIED.
- Unauthenticated requests cannot read or write any user data.
- User ID path variable must match `request.auth.uid`.

## 2. The Dirty Dozen Payloads & Test Scenarios
1. Anonymous user attempts write to `/users/abc/finance/data` -> REJECTED.
2. Authenticated user `user-1` attempts to read `/users/user-2/finance/data` -> REJECTED.
3. Authenticated user `user-1` attempts to write `/users/user-2/finance/data` -> REJECTED.
4. Authenticated user `user-1` attempts to delete `/users/user-2` -> REJECTED.
5. Injected invalid document ID containing special characters `users/$$$malicious$$$` -> REJECTED.
6. Payload missing required `userId` on finance data creation -> REJECTED.
7. Spoofed `userId` in body (`user-2`) differing from `request.auth.uid` (`user-1`) -> REJECTED.
8. Attempt to write to arbitrary unmapped collection `/arbitrary_data/{id}` -> REJECTED by default deny-all rule.
9. Attempt to overwrite `createdAt` timestamp on profile document -> REJECTED.
10. Attempt to read other users' collections in batch -> REJECTED.
11. Unauthenticated read of user profile -> REJECTED.
12. Attempt to bypass rules by tampering with client headers -> REJECTED by Firestore server validation.
