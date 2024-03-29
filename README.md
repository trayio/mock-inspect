![](assets/chameleon.png "chameleon")

mock-inspect
============

![Statement coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Fstatements)
![Function coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Ffunctions)
![Line coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Flines)
![Branches badge](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Fbranches)
[![Mutation badge](https://img.shields.io/badge/Mutation%20Coverage-84.62-green)](https://trayio.github.io/mock-inspect/mutation/)
[![](https://img.shields.io/npm/v/mock-inspect)](https://www.npmjs.com/package/mock-inspect)

Mocks network requests and allows you to make assertions about how these requests happened. Supports auto-mocking of graphQL requests given a valid schema.

An example using jest:

```js
// Let's imagine we are testing an application in which the user has to login.
// We set up a mock for the /login endpoint to not use the real API in our test.
const mock = mockRequest({
    requestPattern: "https://www.yourwebsite.com/login",
    requestMethod: "POST",
    responseStatus: 201,
    responseBody: "Welcome!"
})
// Once the mock is set up, we will execute the application code in our test
// which makes a request to the /login endpoint - the response will be mocked.
// ... Execute your application code which would perform the login ...
// After the request has been executed, we can see how our application made the
// request. For our login scenario, we could check that the application
// forwards the username and password in the correct format as POST payload.
const requestProps = mock.inspect()
expect(requestProps.requestBody).toEqual({username: "Han", password: "Ch3w!3"})
```

# Table of Contents

1. [Installation](#installation)
2. [Setting up your test suite](#setting-up-your-test-suite)
3. [Available functions and classes](#available-functions-and-classes)
4. [Using GraphQL](#using-graphql)
5. [Unresolved promises in tests, i.e. React tests with jest](#unresolved-promises-in-tests-ie-react-tests-with-jest)
6. [Development](#development)

# Installation

Installing mock-inspect is simple: Fetch it from the npm registry using your favourite package manager, either npm or yarn.

```bash
# with npm
npm install --save-dev mock-inspect
# with yarn
yarn add -D mock-inspect
```

# Setting up your test suite

Our mocking solution has to be set up and torn down accordingly after tests. The method `cleanUpNetworkRequestMocking` should run before **each** of your tests, `setUpNetworkRequestMocking()` **once** before all of your tests, and `tearDownNetworkRequestMocking` **once** after all of your tests. How setup steps have to be invoked depends on your test runner. With jest, we would create a [setupTestFrameworkFile](https://jestjs.io/docs/en/23.x/configuration#setuptestframeworkscriptfile-string) which would register the following hooks:

```js
const {
    cleanUpNetworkRequestMocking,
    setUpNetworkRequestMocking,
    tearDownNetworkRequestMocking
} = require("mock-inspect")

beforeEach(() => {
    cleanUpNetworkRequestMocking()
})

beforeAll(() => {
    setUpNetworkRequestMocking()
})

afterAll(() => {
    tearDownNetworkRequestMocking()
})
```

## Persistent auto-generated graphQL responses in the setup phase

For graphQL APIs, we expose functionality in the setup phase to automatically generate graphQL responses from a schema throughout your entire test suite. (These can be overridden if necessary though). The below example sets up the test suite in such a way so that any graphQL request going against https://thisdomaindoesnotexist.com/graphql will be evaluated against the provided graphQLSchema and an automatic response will be generated. [Refer to the type definitions](https://github.com/trayio/mock-inspect/blob/main/src/types/GraphQLAutoMockStartupOptions.ts) for all available options.

```js
beforeAll(() => {
    setUpNetworkRequestMocking({
        persistentAutoGeneratedGraphQLMocks: [
            {
                requestPattern: "https://thisdomaindoesnotexist.com/graphql",
                graphQLSchema: schemaString,
            },
        ]
    })
})
```

## Enable unmocked network requests to pass the network

By default, network requests that aren't expected to be mocked will throw an error saying that a response handler hasn't been set up for this request. You can disable this behaviour by passing the option `blockUnmockedNetworkRequests: true` into the `setUpNetworkRequestMocking` method.

```js
    setUpNetworkRequestMocking({
        allowUnmockedRequestsOnNetwork: true
    })
```

# Available functions and classes

Please find below a list of available functions and class methods. For detailed examples on how to use each of these, check out our [extensive suite of tests](https://github.com/trayio/mock-inspect/tree/main/src/tests). The types for the possible option objects have been thoroughly annotated - make use of your IDE hints to see the full details for each property.

## mockRequest

Mocks a request from scratch using the details you provide.

Receives an object which defines the properties of the request to be mocked and the response to be returned. [Check out the type definition](https://github.com/trayio/mock-inspect/tree/main/src/types/MockResponseOptions.ts) for details of properties you can enter.

Returns an instance of the [MockedRequest](#mockedrequest) object. You can call available methods from this object to inspect the request.

When creating multiple mocks for the same URL, we will always use the response details of the last call to `mockRequest`.

```js
const {mockRequest} = require("mock-inspect")
// Set up mock:
const mock = mockRequest({
    requestPattern: "https://www.yourwebsite.com/login",
    requestMethod: "POST",
    responseStatus: 201,
    responseBody: "Welcome!",
    responseHeaders: {
        "Authorization": "take your token good sir!"
    }
})
// You can now use all available methods on the MockedRequest class, such as
// checking that the request has been made or inspecting which properties have
// been used to make it:
mock.expectRequestToHaveBeenMade()
const requestProps = mock.inspect()
// You can use the requestProps object to make assertions how the request was
// made. See 'inspect' in this documentation for more information.
```

### Using mockRequest for graphQL

Pass the property `graphQLMutationName` or `graphQLQueryName` which should align with the query or mutation you are mocking. For this to work, the graphQL requests by your application **have** to be made with a JSON payload (`content-type: application/json` header) that includes the `query` property.

```js
const firstMockedRequest = mockRequest({
    graphQLMutationName: "FirstMutation",
    responseBody: "Was set up first",
    requestMethod: "POST",
})
const secondMockedRequest = mockRequest({
    graphQLQueryName: "SecondQuery",
    responseBody: "Was set up second",
    requestMethod: "POST",
})

// Receives the mocked response "Was set up second" although was called first
await request(`query SecondQuery { animals { cats } }`)
// Receives the mocked response "Was set up first" although was called second
await request(`mutation FirstMutation(call: "Meow") { id }`)
```

## MockedRequest

Every time you mock a request, you get hold of this class which has the following methods:

### inspect

Returns an object with information about how the network request has been made, using the properties `requestBody` and `requestHeaders`. [Check out the type definition](https://github.com/trayio/mock-inspect/blob/main/src/types/MockedRequestInfo.ts) for details of the returned properties.

If the request has not been made yet on time of calling `.inspect()`, an error message will be thrown.

You can use the request information object in any way you like - you could check for equality, test whether the schema matches (i.e. using [jest-json-schema-extended](https://github.com/rickschubert/jest-json-schema-extended)) and many more!

```js
// Set up mock:
const mock = mockRequest({
    requestPattern: "https://www.yourwebsite.com/login",
    requestMethod: "POST",
    responseStatus: 201,
    responseBody: "Welcome!",
    responseHeaders: {
        "Authorization": "take your token good sir!"
    }
})
// ... Execute in your test application code which should make the request ...
// Use `inspect()` to retrieve information about how the request has been made.
// In the example below, we would use jest's expect method that the request body
// included the correct properties and that JSON format was specified in the
// request headers. You don't have to use jest's expect though - you can use
// the returned object of request information in any way you like!
const requestProps = mock.inspect()
expect(requestProps.requestBody).toEqual({username: "Han", password: "Ch3w!3"})
expect(requestProps.requestHeaders["content-type"]).toEqual("application/json")
```

### expectRequestToHaveBeenMade

Asserts that the network request you mocked has been called.

```js
const loginRequest = mockRequest({/* mock details go here */})
loginRequest.expectRequestToHaveBeenMade()
```

### expectRequestToNotHaveBeenMade

Asserts that the network request you mocked was not called.

```js
const loginRequest = mockRequest({/* mock details go here */})
loginRequest.expectRequestToNotHaveBeenMade()
```

# Using GraphQL

We also support GraphQL - both for creating mocks and asserting on these mocks.

## Mocking graphQL calls by query or mutation name
As outlined [in the section about mockRequest](#using-mockrequest-for-graphql), you have to provide an additional property to pass in the query or mutation name you are mocking so that we know you are mocking a graphQL request.

## Auto-generating graphQL responses
If desired, we can automatically generate a random graphQL response for you. That way, you don't have to manually define the `responseBody` property. To do so, you need to provide us with the graphQL schema of the request that will be made, in the property `graphQLAutoMocking.schema`. (When `graphQLAutoMocking.schema` **and** `responseBody` is given, we will always use the `responseBody` property.)

Consider the following example:

```js
// Note that `responseBody` is not given
const mockedGQLRequestWithSchema = mockRequest({
    requestPattern: /\/graphql/i,
    requestMethod: "POST",
    graphQLQueryName: "MyCoolQuery",
    graphQLAutoMocking: {
        // `schema` accepts a graphQL schema as string. An example:
        // https://github.com/trayio/mock-inspect/blob/main/src/tests/fixtures/simpleGraphQLSchemaString.ts
        schema: simpleGraphQLExampleSchemaString,
    },
})
// The response to this request will be automatically generated. It will look like:
// { me: { name: "Drucill Hubert Lewse the Comer of Avera rejoices Fiann Craggy Florie and 5 hard trouts" } }
const response = await exampleGraphQLPostRequestJson(`
    query MyCoolQuery {
        me {
            name
        }
    }
`)
```

### Setting a fixed length or range for auto-generated array responses
The property `graphQLAutoMocking.fixedArrayLengths` can be used to set a fixed array length or range for arrays that will be auto-generated. For this to work, we need to know of the type and the property in the format `type.property` and the desired length/range.

Consider the below example: We are mocking a graphQL request that is expected to return a `users` array. [As we can see on the schema](https://github.com/trayio/mock-inspect/blob/main/src/tests/fixtures/simpleGraphQLSchemaString.ts#L28), the `users` property sits underneath type `Query`. If we desire the `users` array to be of length `3`, we would pass `"Query.users": 3`. If we desire it to be between the lengths 3 and 7, we would pass `"Query.users": [3, 7]`.

```js
const mockedGQLRequestWithSchema = mockRequest({
    requestPattern: /\/graphql/i,
    requestMethod: "POST",
    graphQLQueryName: "MyCoolQuery",
    graphQLAutoMocking: {
        schema: simpleGraphQLExampleSchemaString,
        fixedArrayLengths: {
            "Query.users": [3, 7],
        },
    },
})
// The property `users` in this response will be of length between 3 and 7
await exampleGraphQLPostRequestJson(`
    query MyCoolQuery {
        users {
            id,
            email,
        }
    }
`)
```

# Unresolved promises in tests, i.e. React tests with jest
Currently, [jest provides no API to flush promises](https://github.com/facebook/jest/issues/2157) on its own. But flushing promises is necessary to have jest execute all built-up promises - and network responses are also promises. Therefore, you must flush the built-up promises manually. For this use case, we recommend using [the async utility `waitFor` which is provided by the "Testing Library" project](https://testing-library.com/docs/dom-testing-library/api-async#waitfor). Alternatively, you could create your own function which flushes a promise and call it as many times as needed:

```js
export const flushPromises = async () => {
    await new Promise(setImmediate)
}
// Call `flushPromises` as many times as needed
await flushPromises()
```

# Development
This library is based on the [msw](https://mswjs.io/) library.

_________________

[Chameleon](https://github.com/trayio/mock-inspect/tree/main/assets/chameleon.png) graphic by <a href="https://pixabay.com/users/monstreh-637659/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3340930">Анна Куликова</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3340930">Pixabay</a>
