# API Documentation

## Overview
This document provides details about the APIs used in the software solution, including endpoints, request/response formats, and authentication methods.

## API Endpoints

### 1. User Authentication

- **Endpoint:** `/api/auth/login`
  - **Method:** POST
  - **Request Body:**
    - `email`: string (required)
    - `password`: string (required)
  - **Response:**
    - **200 OK**
      - `token`: string
      - `user`: object
    - **401 Unauthorized**
      - `message`: string

### 2. User Registration

- **Endpoint:** `/api/auth/register`
  - **Method:** POST
  - **Request Body:**
    - `name`: string (required)
    - `email`: string (required)
    - `password`: string (required)
  - **Response:**
    - **201 Created**
      - `message`: string
    - **400 Bad Request**
      - `errors`: object

### 3. Fetch User Profile

- **Endpoint:** `/api/user/profile`
  - **Method:** GET
  - **Headers:**
    - `Authorization`: Bearer `<token>`
  - **Response:**
    - **200 OK**
      - `user`: object
    - **401 Unauthorized**
      - `message`: string

### 4. Update User Profile

- **Endpoint:** `/api/user/profile`
  - **Method:** PUT
  - **Headers:**
    - `Authorization`: Bearer `<token>`
  - **Request Body:**
    - `name`: string (optional)
    - `email`: string (optional)
  - **Response:**
    - **200 OK**
      - `message`: string
    - **400 Bad Request**
      - `errors`: object

## Authentication
All endpoints require authentication via a Bearer token, which is provided upon successful login. The token must be included in the `Authorization` header for protected routes.

## Error Handling
Responses will include appropriate HTTP status codes and messages to indicate success or failure.