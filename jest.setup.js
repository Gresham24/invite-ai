import jest from "jest"
import "whatwg-fetch"

// Mock environment variables
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud"
process.env.CLOUDINARY_API_KEY = "test-key"
process.env.CLOUDINARY_API_SECRET = "test-secret"
process.env.ANTHROPIC_API_KEY = "test-anthropic-key"
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000"

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock FormData for Node.js environment
if (typeof FormData === "undefined") {
  global.FormData = class FormData {
    constructor() {
      this.data = new Map()
    }

    append(key, value, filename) {
      if (!this.data.has(key)) {
        this.data.set(key, [])
      }
      this.data.get(key).push({ value, filename })
    }

    get(key) {
      const values = this.data.get(key)
      return values ? values[0].value : null
    }

    getAll(key) {
      const values = this.data.get(key)
      return values ? values.map((v) => v.value) : []
    }

    has(key) {
      return this.data.has(key)
    }
  }
}

// Mock File for Node.js environment
if (typeof File === "undefined") {
  global.File = class File {
    constructor(chunks, filename, options = {}) {
      this.name = filename
      this.type = options.type || "application/octet-stream"
      this.size = chunks.reduce((size, chunk) => size + chunk.length, 0)
      this.lastModified = Date.now()
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(this.size))
    }
  }
}
