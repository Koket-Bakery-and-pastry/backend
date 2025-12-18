import { NextFunction } from "express";
import { HttpError } from "../../../core/errors/HttpError";
import { Request, Response } from "express";
import { ContactService } from "../services/contact.service";

export class contactController {
  private ContactService: ContactService;

  constructor() {
    this.ContactService = new ContactService();
  }
  async createContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const contact = await this.ContactService.createContact(data);
      res.status(201).json({
        message: "Contact created successfully",
        contact,
      });
    } catch (error: any) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  }

  async getAllContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const contacts = await this.ContactService.getAllContact();
      res.status(200).json({
        message: "Contacts retrieved successfully",
        contacts,
      });
    } catch (error: any) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  }

  async getContactById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const contact = await this.ContactService.getContactById(id);
      if (!contact) {
        return next(new HttpError(404, "Contact not found"));
      }
      res.status(200).json({
        message: "Contact retrieved successfully",
        contact,
      });
    } catch (error: any) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  }

  async deleteContact(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      await this.ContactService.deleteContact(id);
      res.status(200).json({
        message: "Contact deleted successfully",
      });
    } catch (error: any) {
      next(
        error instanceof HttpError
          ? error
          : new HttpError(500, "Internal Server Error")
      );
    }
  }
}
