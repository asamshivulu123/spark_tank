// This is just a TypeScript type definition for your data
export type User = {
  id: string;
  created_at: string;
  email: string;
  name: string;
  // Add any other fields you need
}

export type Team = {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  // Add any other fields you need
}

// Add more types as needed
