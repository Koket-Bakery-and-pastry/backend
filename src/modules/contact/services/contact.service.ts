import { ContactResponseDto, CreateContactDto } from "../dtos/contact.dto";
import { ContactRepository } from "../repositories/contact.repository";

export class ContactService {
  private contactsRepository: ContactRepository;
  constructor(contactsRepository?: ContactRepository) {
    // allow injection for testing, otherwise create default
    this.contactsRepository = contactsRepository || new ContactRepository();
  }
  async createContact(data: CreateContactDto): Promise<ContactResponseDto> {
    return this.contactsRepository.create(data);
  }

  async getAllContact(): Promise<ContactResponseDto[]> {
    return this.contactsRepository.findAll();
  }
  async getContactById(id: string): Promise<ContactResponseDto | null> {
    return this.contactsRepository.findById(id);
  }
  async deleteContact(id: string): Promise<void> {
    return this.contactsRepository.delete(id);
  }
}
