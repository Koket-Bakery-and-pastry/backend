import Contact from "../../../database/models/contact";
import { ContactResponseDto, CreateContactDto } from "../dtos/contact.dto";

export class ContactRepository {
  async create(data: CreateContactDto): Promise<ContactResponseDto> {
    const payload: any = { ...data };
    const contact = new Contact(payload);
    await contact.save();
    return contact as ContactResponseDto;
  }

  async findAll(): Promise<ContactResponseDto[]> {
    return Contact.find().exec() as Promise<ContactResponseDto[]>;
  }

  async findById(id: string): Promise<ContactResponseDto | null> {
    return Contact.findById(id).exec() as Promise<ContactResponseDto | null>;
  }
}
