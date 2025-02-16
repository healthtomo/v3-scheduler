# HELLO THis is David

# Nylas v3 Scheduler!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/guides/vite) for details on supported features for Remix project.

## Prerequisites

- Nylas Application
- Connectors (Optional)

  > - Google
  > - Microsoft
  > - ICloud
  > - EWS

- Add environment variable to your project

```shellscript
      NYLAS_CLIENT_ID=
      NYLAS_API_KEY=
      API_ENDPOINT=https://api.us.nylas.com/v3
```

- Add two redirect_uri as `JavaScript` to your Nylas application (Optional)
  - `http://localhost:{port}/editor` - Standard Editor Auth
  - `http://localhost:{port}/callback` - Access Token Flow

Run the Vite dev server:

```shellscript
npm install
```

```shellscript
npm run dev
```

## Overview

The v3-scheduler repository is a sample project designed to test the NylasSchedulerEditor and NylasScheduling components.

It supports the following flows:

- `Standard Editor Flow`: Requires the user to re-authenticate for each session.
- `Access Token Flow`: Utilizes an access token for users who have already authenticated within the same origin.
- `No Auth Flow`: Allows use of the editor without re-authentication, provided the account has been authenticated previously.

## Routes

- `/editor` - Where the Editor component is rendered
- `/grants` - Grants List view to access the `No Auth Flow`
- `/scheduler/:configurationId` - Where the NylasScheduling component is rendered
- `/scheduler/auth` - Where the access token flow is triggered from for `Access Token Flow` and authentication/reauthentication flow new and existing grants
- `/scheduler/api` - An API route in remix to make proxy requests for `No Auth Flow`

## Query Params

`/editor` route supports these query parameters:

```typescript
export type EditorQueryParams = {
  configurationId: string; // Used to default to specific configuration
  requiresSlug: boolean; // Used to trigger the Hosted Scheduling pages
  accessType: AccessType; // Used to define which flow the NylasSchedulerEditor operates in. By default it's the Standard flow
  email: string; // Used for No Auth flow
  grantId: string; // Used for No Auth flow
};
```

`/scheduler/:configurationId` route supports these query parameters:

```typescript
// Used to prefill the booking form
export type SchedulerCustomQueryParams = {
  name: string;
  email: string;
};
```

## Access Token Flow

- Users will authenticate using OAuth within the same origin.
- The flow conducts a code exchange and securely stores user credentials in server-side sessions via cookies.
- The `nylasApiRequest` Editor prop and the `CustomIdentityRequestWrapperAccessToken` class is used to make scheduler requests on behalf of an already authenticated user.

> 💡 **Note:**
> This flow is applicable only if you are storing both the access_token and refresh_token associated with the origin where the component is embedded. It follows a similar approach to the one used by our Standard Editor flow.

## No Auth Flow

- This flow will first load all grants in your application that can supports the Scheduling functionalities
- Once you have selected a valid and an applicable grant, it will redirect you to the Scheduler editor page
- This flow utilizes the `CustomIdentityRequestWrapperProxy` class to proxy scheduler component requests to your backend.
- It eliminates the need for user authentication to access the `NylasSchedulerEditor` component.

### High Level (Request -> Response -> `NylasSchedulerEditor`)

- Scheduler Editor: When the scheduler editor is embedded and loaded, it will request the user’s configurations.
- Request Flow: This request hits the CustomIdentityRequestWrapperProxy's request method: [Link to method][1]
  - This method sends a request to your backend with the path, grantId, request method, and body of the request that the scheduler is trying to make.
- Backend Handling: The request is then processed by your backend API: [Link to backend API][2]
- Your backend makes the necessary request and returns the response: [Link to response handling][3]
- Response Delivery: The CustomIdentityRequestWrapperProxy receives this response and passes it back to the components. [CustomIdentityRequestWrapperProxy request method][4]

[1]: https://github.com/kraju3/v3-scheduler/blob/6a3e9ba336136ea9488a1a42af842094e6b69045/app/components/scheduler.identity.ts#L96 "Link to method"
[2]: https://github.com/kraju3/v3-scheduler/blob/6a3e9ba336136ea9488a1a42af842094e6b69045/app/routes/scheduler.api.ts#L6 "Link to backend API"
[3]: https://github.com/kraju3/v3-scheduler/blob/6a3e9ba336136ea9488a1a42af842094e6b69045/app/models/nylas/scheduler.server.ts#L18 "Link to response handling"
[4]: https://github.com/kraju3/v3-scheduler/blob/6a3e9ba336136ea9488a1a42af842094e6b69045/app/components/scheduler.identity.ts#L119 "CustomIdentityRequestWrapperProxy request method"

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.
