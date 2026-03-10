
API Changes
based on x-api-key need to get partner id and pass it to procedures.

UI Changes
UI is not displaying error messages correct which are coming from APIs
Login and registration pages should be part of auth module but currently they are in dashboard module.
Need to verify caching issues. I am seeing dashboard menu after Login and navigate to home, still I am seeing dashboard menu. this is not expected.
After login pages, dashboard menu should not be visible if not logged in. Non-logged in pages should not have dashboard menu. 