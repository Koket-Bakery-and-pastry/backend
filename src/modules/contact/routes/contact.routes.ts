import { Router } from "express";
import { contactController } from "../controllers/contact.controller";
import {
  authenticate,
  authorize,
} from "../../../core/middlewares/auth.middleware";

const router = Router();
const controller = new contactController();

router.post("/", controller.createContact.bind(controller));
router.get(
  "/",
  authenticate,
  authorize("admin"),
  controller.getAllContacts.bind(controller)
);
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  controller.getContactById.bind(controller)
);
/**
 * @swagger
 * tags:
 *   - name: Contacts
 *     description: Contact management
 *
 * /contacts:
 *   post:
 *     summary: Create a contact
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: Contact created
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: A list of contacts
 *
 * /contacts/{id}:
 *   get:
 *     summary: Get a contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact found
 */

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  controller.deleteContact.bind(controller)
);
export default router;
