export interface UserData {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export interface SheetData {
  values: string[][];
  range: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  value: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
