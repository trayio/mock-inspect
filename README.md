![](assets/chameleon.png "chameleon")

mock-inspect
============

![Statement coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Fstatements)
![Function coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Ffunctions)
![Line coverage](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Flines)
![Branches badge](https://img.shields.io/endpoint?url=https%3A%2F%2F35fec4cb-1fbe-4aed-be1f-ea4814d9ba46.trayapp.io%2Fbranches)
[![Mutation badge](https://img.shields.io/badge/Mutation%20Coverage-88.93-green)](https://trayio.github.io/mock-inspect/reports/mutation/html/)


Mock network requests and make assertions about how these requests happened. Supports auto-mocking of graphQL requests given a valid schema.

1. [Available functions and classes](#available-functions-and-classes)
2. [Using GraphQL](#using-graphql)
3. [Setting up your test suite](#setting-up-your-test-suite)
4. [Unresolved promises in tests, i.e. React tests with jest](#unresolved-promises-in-tests-ie-react-tests-with-jest)
5. [Development](#development)

# Available functions and classes

Please find below a list of available functions and class methods. For detailed examples on how to use each of these, check out our [extensive suite of tests](https://github.com/trayio/mock-inspect/tree/main/src/tests). The types for the possible option objects have been thoroughly annotated - make use of your IDE hints to see the full details for each property.

## mockRequest

Mocks a request from scratch using the details you provide and returns a [MockedRequest](#mockedrequest) object. When creating multiple mocks for the same URL, we will always use the response details of the last call to `mockRequest`.

Receives an object which defines the properties of the request to be mocked and the response to be returned. [Check out the type definition](https://github.com/trayio/mock-inspect/tree/main/src/types/MockResponseOptions.ts) for details of properties you can enter.

```js
const {mockRequest} = require("mock-inspect")

const loginRequest = mockRequest({
    requestPattern: "https://www.yourwebsite.com/login",
    requestMethod: "POST",
    responseStatus: 201,
    responseBody: "Welcome!",
    responseHeaders: {
        "Authorization": "take your token good sir!"
    }
})
// ... make a network request somewhere in your actual code ...
// Use available methods on MockedRequest to make assertions
// about how the network request has been made.
loginRequest.expectRequestToHaveBeenMade()
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

## mockRequestFromContract

Mocks a request based on a contract and returns a [MockedRequest](#mockedrequest) object. A contract is an object which holds all the details of a network request - how it is supposed to be made and what it is supposed to return. [Check out the type definition](https://github.com/trayio/mock-inspect/blob/main/src/types/Contract.ts) for details of properties you can enter.

```js
const {mockRequestFromContract} = require("mock-inspect")

const loginContract = {
    response: {
        statusCode: 201,
        body: "Welcome!",
        headers: {
            "Authorization": "take your token good sir!"
        }
    },
    request: {
        url: "https://www.yourwebsite.com/login",
        method: "POST",
        payload: {
            "username": "HanSolo",
            "password": "Never tell me the odds!"
        }
    }
}
const loginRequest = mockRequestFromContract(loginContract)
// ... make a network request somewhere in your actual code ...
loginRequest.expectRequestMadeMatchingContract()
```

## MockedRequest

Every time you mock a request, you get hold of this class which has the following methods:

### expectRequestToHaveBeenMade

Asserts that the network request you mocked also has been called.

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

### expectRequestMadeMatching

Asserts that the network request you mocked was called with the expected properties. [Check out the type definition](https://github.com/trayio/mock-inspect/blob/main/src/types/ExpectRequestMadeMatchingInput.ts) for details of the properties you can provide here.

If you created your mocked request from a contract, you most likely want to use [expectRequestMadeMatchingContract](##expectrequestmadematchingcontract) instead.

```js
const loginRequest = mockRequest({/* mock details go here */})
loginRequest.expectRequestMadeMatching({
    requestPayload: {
        "username": "HanSolo",
        "password": "Never tell me the odds!"
    },
    requestHeaders: {
        "Authorization": "I provided my token in the request header"
    }
})
```

### expectRequestMadeMatchingContract

Asserts that the network request you mocked was called with the expected properties as provided in the contract. [Check out the type definition](https://github.com/trayio/mock-inspect/blob/main/src/types/Contract.ts) for details of how a Contract looks like.

If you create your MockedRequest object using `mockRequestFromContract`, you do not have to pass in any arguments to `expectRequestMadeMatchingContract`. If you created your MockedRequest using `mockRequest`, you have to pass in a contract though so that we can know what expectations you refer to.

```js
const loginContract = {
    response: {
        statusCode: 201,
        body: "Welcome!",
        headers: {
            "Authorization": "take your token good sir!"
        }
    },
    request: {
        url: "https://www.yourwebsite.com/login",
        method: "POST",
        payload: {
            "username": "HanSolo",
            "password": "Never tell me the odds!"
        }
    }
}

// When created using mockRequestFromContract:
const loginRequest = mockRequestFromContract(loginContract)
loginRequest.expectRequestMadeMatchingContract()

// When created using mockRequest:
const loginRequest = mockRequest({/* mock details go here */})
loginRequest.expectRequestMadeMatchingContract(loginContract)
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

## Making graphQL contract assertions
A note on comparing actual graphQL requests against your defined expectations: Whenever we realise that you created a mock using a URL that ended in `/graphql`, we will assume that you are using a GraphQL API. In order to compare the request payloads, we convert both payloads to JSON objects - basically a **reverse** version of the library [json-to-graphql-query](https://github.com/dupski/json-to-graphql-query). We can then compare these two objects against each other to check whether all properties have been set or whether some have been missing.

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

## Tests
By default, mock-inspect clips the stack trace so that we don't show internals to the user when errors throw but rather point to the line in their test where they used mock-inspect which caused an error. For debugging tests, this can be annoying - so you can disable this feature by passing the environment variable `AVOID_CLIPPED_STACKTRACE=true`.

_________________

[Chameleon](https://github.com/trayio/mock-inspect/tree/main/assets/chameleon.png) graphic by <a href="https://pixabay.com/users/monstreh-637659/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3340930">Анна Куликова</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=3340930">Pixabay</a>
