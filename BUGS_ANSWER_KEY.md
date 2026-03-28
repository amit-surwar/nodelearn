# Answer Key — All 10 Bug Fixes

> Only read this AFTER you've tried to find and fix all bugs yourself!

---

## Bug 1 — `src/utils/validation.js`
**Problem**: `age` is validated as `z.string()` instead of `z.number()`
**Impact**: Age accepts text like "abc" instead of actual numbers
**Fix**:
```js
// BEFORE (buggy)
age: z.string().optional(),

// AFTER (fixed)
age: z.number().int().min(13).max(120).optional(),
```

---

## Bug 2 — `src/repositories/userRepository.js` → `findAllUsers`
**Problem**: `find()` has no filter for `deleted_at: null`, so soft-deleted users still appear
**Impact**: Deleted users show up in the "all users" list
**Fix**:
```js
// BEFORE (buggy)
const users = await User.find().select("-password");

// AFTER (fixed)
const users = await User.find({ deleted_at: null }).select("-password");
```

---

## Bug 3 — `src/repositories/userRepository.js` → `updateUser`
**Problem**: `findByIdAndUpdate` uses `{ new: false }` — returns the OLD document before the update
**Impact**: After updating, the API returns stale data that doesn't reflect the changes
**Fix**:
```js
// BEFORE (buggy)
{ new: false, runValidators: true }

// AFTER (fixed)
{ new: true, runValidators: true }
```

---

## Bug 4 — `src/repositories/userRepository.js` → `deleteUser`
**Problem**: Uses `findByIdAndDelete()` which permanently removes the record (hard delete)
**Impact**: User data is destroyed forever instead of being marked as deleted
**Fix**:
```js
// BEFORE (buggy)
const user = await User.findByIdAndDelete(id);

// AFTER (fixed)
const user = await User.findByIdAndUpdate(
  id,
  { deleted_at: new Date(), is_active: false },
  { new: true }
).select("-password");
```

---

## Bug 5 — `src/services/userService.js` → `createUser`
**Problem**: `bcrypt.hash(password, 1)` uses salt rounds of 1 — almost no security
**Impact**: Passwords can be cracked almost instantly with brute force
**Fix**:
```js
// BEFORE (buggy)
const hashedPassword = await bcrypt.hash(userData.password, 1);

// AFTER (fixed)
const hashedPassword = await bcrypt.hash(userData.password, 10);
```

---

## Bug 6 — `src/services/userService.js` → `createUser`
**Problem**: No check for existing email before creating the user
**Impact**: MongoDB throws an ugly error on duplicate email instead of a clean message
**Fix**:
```js
// Add this BEFORE hashing the password:
const existingUser = await userRepository.findUserByEmail(userData.email);
if (existingUser) {
  throw new AppError("Email already registered", 409);
}
```

---

## Bug 7 — `src/services/userService.js` → `deleteUser`
**Problem**: The service says "User soft deleted successfully" but the repository does a hard delete
**Impact**: Misleading response — the user thinks data is preserved when it's actually gone
**Fix**: This gets fixed automatically when you fix Bug 4 (the repository). The message
becomes accurate once the repository actually does a soft delete.

---

## Bug 8 — `src/controllers/userController.js` → `createUser`
**Problem**: Returns status code 200 instead of 201 for resource creation
**Impact**: Violates REST convention — clients can't distinguish "fetched" from "created"
**Fix**:
```js
// BEFORE (buggy)
return sendSuccess(res, user, {}, 200);

// AFTER (fixed)
return sendSuccess(res, user, {}, 201);
```

---

## Bug 9 — `src/controllers/userController.js` → `updateUser`
**Problem**: Validates with Zod (`parsed`) but then sends raw `req.body` to the service
**Impact**: Extra/unvalidated fields bypass Zod and get saved to the database
**Fix**:
```js
// BEFORE (buggy)
const user = await userService.updateUser(req.params.id, req.body);

// AFTER (fixed)
const user = await userService.updateUser(req.params.id, parsed);
```

---

## Bug 10 — `src/routes/userRoutes.js`
**Problem**: Create user route uses `router.get("/create", ...)` instead of `router.post("/", ...)`
**Impact**: Can't send a request body with GET, and it violates REST conventions
**Fix**:
```js
// BEFORE (buggy)
router.get("/create", userController.createUser);

// AFTER (fixed)
router.post("/", userController.createUser);
```

---

## Congratulations!

If you found and fixed all 10, you now understand:
- Input validation with Zod
- Soft delete vs hard delete
- Proper REST status codes and HTTP methods
- Password security (bcrypt salt rounds)
- The importance of using validated data (not raw input)
- Duplicate checking before database writes
- Mongoose query options (new: true vs new: false)

These are EXACTLY the kinds of bugs you'll encounter in real backend work!
