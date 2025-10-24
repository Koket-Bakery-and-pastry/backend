const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Koket Bakery API",
    version: "1.0.0",
    description:
      "API documentation for carts, catalog, products, reviews and users",
  },
  servers: [
    {
      url: "/api/v1",
    },
  ],
  tags: [
    { name: "Users", description: "User registration and authentication" },
    { name: "Products", description: "Product catalog operations" },
    { name: "Categories", description: "Category management" },
    { name: "Subcategories", description: "Subcategory management" },
    { name: "Reviews", description: "Product reviews and ratings" },
    { name: "Carts", description: "Shopping cart operations" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      // common schemas
      UserRegister: {
        type: "object",
        description: "Payload to register a new user",
        required: ["email", "password", "name"],
        properties: {
          name: {
            type: "string",
            description: "Full name of the user",
            example: "Aisha Ahmed",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email (unique)",
            example: "aisha@example.com",
          },
          password: {
            type: "string",
            description: "Plain-text password (min 8 chars recommended)",
            example: "P@ssw0rd!",
          },
        },
      },

      // Product entity
      Product: {
        type: "object",
        description: "Product available in the catalog",
        required: ["name", "price", "categoryId"],
        properties: {
          id: {
            type: "string",
            description: "Product id (UUID or Mongo ObjectId)",
            example: "64f6ef...",
          },
          name: {
            type: "string",
            description: "Product title",
            example: "Chocolate Fudge Cake",
          },
          description: {
            type: "string",
            description: "Detailed description",
            example: "Rich chocolate cake with fudge frosting",
          },
          price: {
            type: "number",
            format: "float",
            description: "Unit price in local currency",
            example: 25.5,
          },
          sku: {
            type: "string",
            description: "Stock keeping unit (optional)",
            example: "CK-CHOC-001",
          },
          categoryId: {
            type: "string",
            description: "Parent category id",
            example: "64f6e0...",
          },
          subcategoryId: {
            type: "string",
            description: "Optional subcategory id",
            example: "64f6e1...",
          },
          images: {
            type: "array",
            description: "Array of image URLs",
            items: {
              type: "string",
              format: "uri",
              example: "https://cdn.example.com/images/1.jpg",
            },
          },
          stock: {
            type: "integer",
            description: "Available stock quantity",
            example: 12,
          },
          isActive: {
            type: "boolean",
            description: "If false the product is hidden from customers",
            example: true,
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      Category: {
        type: "object",
        description: "Top-level product category",
        required: ["name"],
        properties: {
          id: {
            type: "string",
            description: "Category id",
            example: "64f6e0...",
          },
          name: {
            type: "string",
            description: "Category name",
            example: "Cakes",
          },
          description: {
            type: "string",
            description: "Optional description",
            example: "Layer cakes and celebration cakes",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      Subcategory: {
        type: "object",
        description: "Category child used to group similar products",
        required: ["name", "categoryId"],
        properties: {
          id: {
            type: "string",
            description: "Subcategory id",
            example: "64f6e1...",
          },
          name: {
            type: "string",
            description: "Subcategory name",
            example: "Birthday Cakes",
          },
          categoryId: {
            type: "string",
            description: "Parent category id (ref)",
            example: "64f6e0...",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      CartItem: {
        type: "object",
        description: "An item inside a user's cart",
        required: ["productId", "quantity"],
        properties: {
          id: {
            type: "string",
            description: "Cart item id",
            example: "64f6f2...",
          },
          productId: {
            type: "string",
            description: "Referenced product id",
            example: "64f6ef...",
          },
          quantity: {
            type: "integer",
            description: "Requested quantity",
            example: 2,
            minimum: 1,
          },
          unitPrice: {
            type: "number",
            format: "float",
            description: "Price per unit at time of adding",
            example: 25.5,
          },
          totalPrice: {
            type: "number",
            format: "float",
            description: "Computed total price (unitPrice * quantity)",
            example: 51.0,
          },
          notes: {
            type: "string",
            description: "Optional notes for custom orders",
            example: "No nuts",
          },
          addedAt: { type: "string", format: "date-time" },
        },
      },

      ProductReview: {
        type: "object",
        description: "A review left by a user for a product",
        required: ["productId", "rating"],
        properties: {
          id: {
            type: "string",
            description: "Review id",
            example: "64f701...",
          },
          productId: {
            type: "string",
            description: "Reviewed product id",
            example: "64f6ef...",
          },
          userId: {
            type: "string",
            description: "Author user id",
            example: "64f69a...",
          },
          rating: {
            type: "integer",
            minimum: 1,
            maximum: 5,
            description: "Integer rating from 1 to 5",
            example: 5,
          },
          title: {
            type: "string",
            description: "Short headline",
            example: "Delicious",
          },
          comment: {
            type: "string",
            description: "Full review text",
            example: "The cake was moist and the frosting was perfect.",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      // Request / Response wrappers and auth schemas
      UserRegisterRequest: { $ref: "#/components/schemas/UserRegister" },
      UserRegisterResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          user: { type: "object" },
        },
      },

      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },

      AuthResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              role: { type: "string" },
            },
          },
          tokens: { $ref: "#/components/schemas/AuthTokens" },
        },
      },

      ProductResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          product: { $ref: "#/components/schemas/Product" },
        },
      },

      ProductsListResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          products: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
        },
      },

      CategoryResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          category: { $ref: "#/components/schemas/Category" },
        },
      },
      CategoriesListResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          categories: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
        },
      },
      SubcategoryResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          subcategory: { $ref: "#/components/schemas/Subcategory" },
        },
      },
      SubcategoriesListResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          subcategories: {
            type: "array",
            items: { $ref: "#/components/schemas/Subcategory" },
          },
        },
      },

      CartItemResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          cartItem: { type: "object" },
        },
      },
      CartItemsListResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          cartItems: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
        },
      },

      ProductReviewResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          review: { $ref: "#/components/schemas/ProductReview" },
        },
      },
      ProductReviewsListResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          reviews: {
            type: "array",
            items: { $ref: "#/components/schemas/ProductReview" },
          },
        },
      },
      MessageResponse: {
        type: "object",
        properties: { message: { type: "string" } },
      },
    },
  },
  paths: {
    "/users/register": {
      post: {
        tags: ["Users"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegister" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserRegisterResponse" },
              },
            },
          },
          "400": { description: "Validation error" },
        },
      },
    },

    "/auth/register": {
      post: {
        tags: ["Users"],
        summary: "Register (auth) - returns tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegister" },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered with tokens",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Users"],
        summary: "Authenticate user and return tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Auth success",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { description: "Invalid credentials" },
        },
      },
    },

    "/auth/refresh": {
      post: {
        tags: ["Users"],
        summary: "Refresh tokens using refresh token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { refreshToken: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "New tokens",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },

    "/auth/google": {
      get: {
        tags: ["Users"],
        summary: "Start Google OAuth (redirect)",
        responses: { "302": { description: "Redirect to Google" } },
      },
    },

    "/auth/google/callback": {
      get: {
        tags: ["Users"],
        summary: "Google OAuth callback",
        responses: {
          "200": {
            description: "OAuth callback returns tokens/user info",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
        },
      },
    },

    "/products": {
      post: {
        tags: ["Products"],
        summary: "Create a product",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Product" },
              example: {
                name: "Chocolate Fudge Cake",
                description: "Rich chocolate cake with fudge",
                price: 25.5,
                categoryId: "64f6e0...",
                subcategoryId: "64f6e1...",
                images: ["https://cdn.example.com/images/1.jpg"],
                stock: 10,
              },
            },
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  categoryId: { type: "string" },
                  subcategoryId: { type: "string" },
                  image: { type: "string", format: "binary" },
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                  stock: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          "400": { description: "Bad request" },
        },
      },
      get: {
        tags: ["Products"],
        summary: "Get all products",
        parameters: [
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "subcategoryId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductsListResponse" },
                example: {
                  message: "Products retrieved successfully",
                  products: [
                    {
                      id: "64f6ef...",
                      name: "Chocolate Fudge Cake",
                      price: 25.5,
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          "400": { description: "Bad request" },
          "404": { description: "Not found" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Product" },
            },
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  categoryId: { type: "string" },
                  subcategoryId: { type: "string" },
                  image: { type: "string", format: "binary" },
                  images: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                  },
                  stock: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          "400": { description: "Bad request" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          "404": { description: "Not found" },
        },
      },
    },

    "/categories": {
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Categories"],
        summary: "Get all categories",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoriesListResponse" },
                example: {
                  message: "Categories retrieved successfully",
                  categories: [{ id: "64f6e0...", name: "Cakes" }],
                },
              },
            },
          },
        },
      },
    },
    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get category by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Update category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Category" },
            },
          },
        },
        responses: { "200": { description: "Updated" } },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete category",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
        },
      },
    },

    "/subcategories": {
      post: {
        tags: ["Subcategories"],
        summary: "Create a subcategory",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Subcategory" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SubcategoryResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Subcategories"],
        summary: "Get all subcategories",
        parameters: [
          { name: "categoryId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SubcategoriesListResponse",
                },
                example: {
                  message: "Subcategories retrieved successfully",
                  subcategories: [
                    {
                      id: "64f6e1...",
                      name: "Birthday Cakes",
                      categoryId: "64f6e0...",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/subcategories/{id}": {
      get: {
        tags: ["Subcategories"],
        summary: "Get subcategory by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
        },
      },
      put: {
        tags: ["Subcategories"],
        summary: "Update subcategory",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Subcategory" },
            },
          },
        },
        responses: { "200": { description: "Updated" } },
      },
      delete: {
        tags: ["Subcategories"],
        summary: "Delete subcategory",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SubcategoryResponse" },
              },
            },
          },
        },
      },
    },

    "/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create or update a product review",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductReview" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created/Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductReviewResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Reviews"],
        summary: "Get product reviews",
        parameters: [
          { name: "productId", in: "query", schema: { type: "string" } },
          { name: "userId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductReviewsListResponse",
                },
                example: {
                  message: "Product reviews fetched successfully",
                  reviews: [
                    {
                      id: "64f701...",
                      productId: "64f6ef...",
                      userId: "64f69a...",
                      rating: 5,
                      comment: "Great",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/reviews/{id}": {
      get: {
        tags: ["Reviews"],
        summary: "Get review by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        tags: ["Reviews"],
        summary: "Update review",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductReview" },
            },
          },
        },
        responses: { "200": { description: "Updated" } },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete review",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "204": { description: "Deleted" } },
      },
    },

    "/carts": {
      post: {
        tags: ["Carts"],
        summary: "Add item to cart",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartItem" },
            },
          },
        },
        responses: {
          "201": {
            description: "Added",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItemResponse" },
                example: {
                  message: "Cart item added/updated successfully",
                  cartItem: {
                    id: "64f6f2...",
                    productId: "64f6ef...",
                    quantity: 2,
                    unitPrice: 25.5,
                    totalPrice: 51.0,
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Carts"],
        summary: "Get user's cart",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItemsListResponse" },
              },
            },
          },
        },
      },
      // Note: clearing the cart is implemented as DELETE /carts/clear in the code
      // the route is documented below as /carts/clear for accuracy
    },
    "/carts/{id}": {
      patch: {
        tags: ["Carts"],
        summary: "Update cart item",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartItem" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItemResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Carts"],
        summary: "Delete cart item",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItemResponse" },
              },
            },
          },
        },
      },
    },
    "/carts/clear": {
      delete: {
        tags: ["Carts"],
        summary: "Clear user cart",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Cleared",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
                example: { message: "User cart cleared successfully" },
              },
            },
          },
        },
      },
    },
  },
};

export default openApiDocument;
