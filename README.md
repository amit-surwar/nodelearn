# Buggy User API — Find & Fix the Bugs!

A User Management REST API with **10 intentional bugs** hidden inside.
Your job: find every bug, understand why it's a problem, and fix it.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Make sure MongoDB is running locally
# (use MongoDB Compass to connect to mongodb://localhost:27017)

# 3. Start the server
npm run dev
```

The server runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| GET    | /api/v1/health       | Health check      |
| GET    | /api/v1/users        | Get all users     |
| GET    | /api/v1/users/:id    | Get user by ID    |
| POST   | /api/v1/users        | Create a user     |
| PUT    | /api/v1/users/:id    | Update a user     |
| DELETE | /api/v1/users/:id    | Delete a user     |

---

## Postman Test Data

### Create User (POST /api/v1/users)
```json
{
  "name": "Sapna",
  "email": "sapna@example.com",
  "password": "password123",
  "age": 25,
  "role": "user"
}
```

### Update User (PUT /api/v1/users/:id)
```json
{
  "name": "Sapna Updated",
  "age": 26
}
```

---

## Your Mission: Find 10 Bugs

Each bug has a hint comment in the source code. Here's the summary:

| Bug # | File                          | Hint                                     |
| ----- | ----------------------------- | ---------------------------------------- |
| 1     | src/utils/validation.js       | A field accepts the wrong data type      |
| 2     | src/repositories/userRepo...  | Deleted users still show up in results   |
| 3     | src/repositories/userRepo...  | Update returns stale/old data            |
| 4     | src/repositories/userRepo...  | "Soft delete" is actually hard deleting  |
| 5     | src/services/userService.js   | Password hashing is dangerously weak     |
| 6     | src/services/userService.js   | Duplicate emails don't get caught        |
| 7     | src/services/userService.js   | Delete says "soft delete" but isn't      |
| 8     | src/controllers/userContr...  | Wrong HTTP status code on create         |
| 9     | src/controllers/userContr...  | Validated data is ignored after parsing  |
| 10    | src/routes/userRoutes.js      | Wrong HTTP method on a route             |

---

## How to Debug

1. **Read the hint** — each bug has a comment explaining what area to look at
2. **Test with Postman** — send requests and observe the responses
3. **Check MongoDB Compass** — look at what's actually stored in the database
4. **Use console.log()** — add logs to trace what data flows through each layer
5. **Use VS Code debugger** — set breakpoints and inspect variables live

---

## How to Verify Your Fixes

After fixing each bug, test it:

- **Bug 1**: Send `age: "abc"` in create — it should be rejected
- **Bug 2**: Soft-delete a user, then GET /users — deleted user should NOT appear
- **Bug 3**: Update a user, check the response — it should show the NEW data
- **Bug 4**: Delete a user, check MongoDB Compass — record should still exist with deleted_at set
- **Bug 5**: Check the bcrypt salt rounds — should be 10 or higher
- **Bug 6**: Create two users with the same email — second one should be rejected with a clear error
- **Bug 7**: This is connected to Bug 4 — once you fix the repository, this message becomes accurate
- **Bug 8**: Create a user — response status should be 201, not 200
- **Bug 9**: Send extra fields in update body — only validated fields should be saved
- **Bug 10**: Try POST /api/v1/users — it should work (not GET /create)

---

## Answer Key

Once you've attempted all 10, check `BUGS_ANSWER_KEY.md` for the solutions.

**No peeking before you try!**
