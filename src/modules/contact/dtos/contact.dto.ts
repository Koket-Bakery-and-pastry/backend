export interface CreateContactDto {
  name: string;
  email?: string;
  phone_number?: string;
  message: string;
}

export interface ContactResponseDto {
  name: string;
  email?: string;
  phone_number?: string;
  message: string;
  created_at: Date;
}
